from functools import partial
from motor.motor_asyncio import AsyncIOMotorClient
from nonebot import get_bot


def get_coll(name):
    conf = get_bot().config
    f = lambda name: getattr(conf, f'MONGO_{name.upper()}', None)
    args = {k: f(k) for k in ['host', 'port', 'username', 'password'] if f(k)}
    return AsyncIOMotorClient(**args)[f('NAME')][name]
