import logging
from typing import Any, Dict, Optional

from aiomirai import *
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from quart import Quart

from .log import logger
from .plugin import load_plugin, load_plugins
from .validate import config_schema

scheduler = AsyncIOScheduler()


class SiBot(SessionApi):
    def __init__(self, config):
        config = config_schema.validate(config)
        logger.debug('Loaded configurations: %s', config)
        super().__init__(config['api_root'], config['auth_key'], config['qq'])
        self.config = config
        self.app = Quart(__name__)
        self.app.debug = config['debug']

        @self.app.before_serving
        async def _():
            await self.auth()
            await self.verify()
            scheduler.configure()
            scheduler.start()
            logger.info('Scheduler started')
            logger.debug('Timezone: %s', str(scheduler.timezone))

        @self.app.after_serving
        async def _():
            await self.release()

        self.recv = ReportReceiver(self.app, config['endpoint'])
        self.cmd = CommandManager(self, config['prefix'])
        self.recv.on('FriendMessage')(self.cmd.handle_command)
        self.recv.on('GroupMessage')(self.cmd.handle_command)

    def run(self,
            host: Optional[str] = None,
            port: Optional[int] = None,
            *args,
            **kwargs) -> None:
        host = host or self.config['host']
        port = port or self.config['port']
        if 'debug' not in kwargs:
            kwargs['debug'] = True

        logger.info('Running on %s:%d', host, port)
        self.app.run(host, port, *args, **kwargs)

    async def call_action(self, action: str, *args, **kwargs) -> Any:
        if not self.session_key:
            await self.auth()
            await self.verify()
        try:
            return await super().call_action(action, *args, **kwargs)
        except (Unauthenticated, InvalidSession, Unverified):
            await self.auth()
            await self.verify()
            return await self.call_action(action, *args, **kwargs)


_bot: Optional[SiBot] = None


def init(config: Optional[dict] = None) -> None:
    if config['debug']:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    global _bot
    _bot = SiBot(config)
    for plug in config.get('plugins', []):
        load_plugin(plug)


def get_bot() -> SiBot:
    if _bot is None:
        raise ValueError('SiBot instance has not been initialized')
    return _bot


def get_conf() -> Dict[str, Any]:
    return get_bot().config


def run(host: Optional[str] = None,
        port: Optional[int] = None,
        *args,
        **kwargs):
    get_bot().run(host, port, *args, **kwargs)


def on_command(name: str):
    return get_bot().cmd.on_command(name)


def on_event(name: str):
    return get_bot().recv.on(name)


from .db import get_coll
from .command import CommandManager, CommandSession
from .permission import Perm, check_perm, update_perm
