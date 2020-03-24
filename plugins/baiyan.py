from nonebot import on_command, CommandSession
from nonebot import on_natural_language, NLPSession
from motor.motor_asyncio import AsyncIOMotorClient
from random import randint

from config import MONGO_URL, MONGO_DB


def getcoll():
    return AsyncIOMotorClient(MONGO_URL)[MONGO_DB]['baiyan']

@on_natural_language
async def _(session: NLPSession):
    if session.ctx['user_id'] == 1395644591:
        coll = getcoll()
        await coll.insert_one({'name': 'shiro酱', 'content': session.msg})

@on_command('baiyan')
async def _(session: CommandSession):
    coll = getcoll()
    arg = session.current_arg.strip()
    if arg == '':
        cursor = coll.find()
        all = await cursor.to_list(length=None)
        rtn = all[randint(0, len(all) - 1)]
        await session.send('\n[白言] {}:\n{}'.format(rtn['name'], rtn['content']), at_sender=True)
    elif arg.startswith('info'):
        cursor = coll.find()
        size = len(await cursor.to_list(length=None))
        await session.send('\n[白言] 距今已有 {} 条白言于数据库中'.format(size), at_sender=True)
    elif arg.startswith('query'):
        rtn = await coll.find_one({'content': {'$regex': arg.split('query', 1)[1].strip()}})
        if rtn:
            await session.send('\n[白言] {}:\n{}'.format(rtn['name'], rtn['content']), at_sender=True)
        else:
            await session.send('\n[白言] shiro酱: 我没说过', at_sender=True)
    else:
        await session.send('\n[白言] 参数不正确，?baiyan <query|info> ...', at_sender=True)
