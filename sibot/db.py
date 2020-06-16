from copy import copy

from motor.motor_asyncio import AsyncIOMotorClient

from . import get_conf


def get_coll(name):
    conf: dict = copy(get_conf()['mongo'])
    db = conf.pop('db')
    if not conf:
        raise ValueError('No db configured. Aborting.')
    return AsyncIOMotorClient(**conf, connectTimeoutMS=5000)[db][name]
