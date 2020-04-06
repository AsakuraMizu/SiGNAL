from motor.motor_asyncio import AsyncIOMotorClient
from sibot import uconf


def get_coll(name):
    f = lambda name: uconf['db'][name]
    args = {k: f(k) for k in ['host', 'port', 'username', 'password'] if f(k)}
    return AsyncIOMotorClient(**args)[f('name')][name]
