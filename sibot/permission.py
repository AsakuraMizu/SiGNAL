from enum import Enum
from typing import Set

from aiomirai import Event

from . import get_conf
from .db import get_coll
from .log import logger


class Perm(Enum):
    banned = -1
    private = 0
    group = 1
    temp = 2
    friend = 3
    group_admin = 4
    group_owner = 5
    bot_sponsor = 100
    bot_helper = 1000
    bot_admin = 10000


async def _query_perm(qq: int) -> Set[Perm]:
    db = get_coll('user')
    result = await db.find_one({'qq': qq})
    res = set()
    if not result:
        return res
    if result.get('banned'):
        res.add(Perm.banned)
    if result.get('bot_sponsor'):
        res.add(Perm.bot_sponsor)
    if result.get('bot_helper'):
        res.add(Perm.bot_helper)
        res.add(Perm.group_admin)
    return res


async def update_perm(qq: int, name: str, val: bool):
    db = get_coll('user')
    return await db.find_one_and_update(
        {'qq': qq},
        {'$set': {name: val}},
        upsert=True
    )


async def _get_perm(event: Event) -> Set[Perm]:
    sender = event['sender']
    try:
        res = await _query_perm(sender['id'])
    except:
        logger.exception('Unable to get permission info from database')
        res = set()
    if sender['id'] in get_conf()['admin']:
        res.add(Perm.bot_admin)
        res.add(Perm.bot_helper)
        res.add(Perm.bot_sponsor)
        res.add(Perm.group_admin)
        res.add(Perm.group_owner)
    if event['type'] == 'TempMessage':
        res.add(Perm.private)
        res.add(Perm.temp)
    elif event['type'] == 'FriendMessage':
        res.add(Perm.private)
        res.add(Perm.friend)
    elif event['type'] == 'GroupMessage':
        res.add(Perm.group)
        if sender['permission'] == 'ADMINISTRATOR':
            res.add(Perm.group_admin)
        elif sender['permission'] == 'OWNER':
            res.add(Perm.group_admin)
            res.add(Perm.group_owner)
    return res


async def check_perm(event: Event, required: Set[Perm]) -> bool:
    curr = await _get_perm(event)
    return required.issubset(curr)
