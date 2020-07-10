from motor.motor_asyncio import AsyncIOMotorClient

from . import get_conf


def get_coll(name):
    conf = get_conf().mongo
    if not conf:
        raise ValueError('No db configured. Aborting.')
    return AsyncIOMotorClient(**conf.dict(exclude={'db', 'password'}),
                              password=conf.password.get_secret_value(),
                              connectTimeoutMS=5000)[conf.db][name]
