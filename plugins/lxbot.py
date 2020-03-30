from nonebot import get_bot, scheduler
from nonebot import MessageSegment as msgs
from nonebot import on_natural_language, NLPSession
from nonebot import logger

import asyncio

TEST_GROUP = 1009541730
REPORT_GROUP = 951585303
AT_QQ = 2941383730

flag = True

@scheduler.scheduled_job('interval', minutes=1)
async def _():
    global flag
    if not flag:
        logger.warning('[LxBot Checker] No LxBot currently online.')
        await get_bot().send_group_msg(group_id=REPORT_GROUP, message=msgs.at(AT_QQ) + msgs.text('lxlx，软糖酱炸了'))
        await asyncio.sleep(1)
        await get_bot().send_group_msg(group_id=REPORT_GROUP, message='/x stat')
        await asyncio.sleep(1.5)
        await get_bot().send_group_msg(group_id=REPORT_GROUP, message='软——糖——酱——')
    await get_bot().send_group_msg(group_id=TEST_GROUP, message='/x help')
    logger.info('[LxBot Checker] Checking status now. Waiting for response.')
    flag = False

@on_natural_language('LxBot', only_short_message=False)
async def _(session: NLPSession):
    global flag
    if session.ctx['group_id'] == TEST_GROUP:
        flag = True
        logger.info('[LxBot Checker] Response got. Currently online: ' + str(session.ctx['user_id']))
