from motor.motor_asyncio import AsyncIOMotorClient
from nonebot import on_command, CommandSession, message_preprocessor, NoneBot, aiocqhttp
from nonebot.argparse import ArgumentParser
from random import randint
from re import escape

from utils import get_coll, sender


def _gen(cmd: str, name: str, rec: list):
    getcoll = lambda: get_coll(cmd)

    @message_preprocessor
    async def _(bot: NoneBot, event: aiocqhttp.Event):
        for user in rec:
            if event.user_id == user['qq']:
                coll = getcoll()
                await coll.insert_one({'name': user['name'], 'content': event.raw_message})
                break

    async def rand(args):
        coll = getcoll()
        cursor = coll.find()
        all = await cursor.to_list(length=None)
        rtn = all[randint(0, len(all) - 1)]
        return f"[{name}] {rtn['name']}:\n{rtn['content']}"

    async def info(args):
        coll = getcoll()
        size = await coll.estimated_document_count()
        return f"[{name}] 距今已有 {size} 条{name}于数据库中"

    async def query(args):
        coll = getcoll()
        cursor = coll.find({'content': {'$regex': escape(args.keyword)}})
        all = await cursor.to_list(length=None)
        if len(all):
            rtn = all[randint(0, len(all) - 1)]
            return f"[{name}] {rtn['name']}:\n{rtn['content']}"
        else:
            return f"[{name}] {rec[0]['name']}: 我没说过"

    @on_command(cmd, shell_like=True)
    async def _(session: CommandSession):
        coll = getcoll()
        parser = ArgumentParser(session=session, usage='')
        parser.set_defaults(func=rand)

        subparsers = parser.add_subparsers()

        parser_info = subparsers.add_parser('info')
        parser_info.set_defaults(func=info)

        parser_query = subparsers.add_parser('query')
        parser_query.add_argument('keyword', help='关键词')
        parser_query.set_defaults(func=query)

        args = parser.parse_args(session.argv)
        await sender(session, await args.func(args))

_gen('lxyan', '雪言', [{"qq": 2941383730, "name": '落雪ちゃん'}, {"qq": 462928960, "name": '软糖酱私用机'}])
_gen('baiyan', '白言', [{"qq": 1395644591, "name": 'shiro酱'}])
