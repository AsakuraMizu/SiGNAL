from nonebot import get_bot, scheduler
from nonebot import MessageSegment as msgs
from nonebot import on_natural_language, NLPSession
from nonebot import logger

import asyncio

TEST_GROUP = 1009541730
REPORT_GROUP = 951585303
AT_QQ = 2941383730

flag = 0

@scheduler.scheduled_job('interval', minutes=1)
async def _():
    global flag
    if flag:
        logger.warning('[LxBot Checker] No LxBot currently online.')
        if flag == 1:
            await get_bot().send_group_msg(group_id=REPORT_GROUP, message=msgs.at(AT_QQ) + msgs.text(' lxlx，软糖酱炸了'))
            await asyncio.sleep(3)
            await get_bot().send_group_msg(group_id=REPORT_GROUP, message='/x stat')
            await asyncio.sleep(5)
            await get_bot().send_group_msg(group_id=REPORT_GROUP, message='软——糖——酱——')
        else:
            await get_bot().send_group_msg(group_id=REPORT_GROUP, message=f'软糖酱已持续不在线 {flag} 分钟......')
    await get_bot().send_group_msg(group_id=TEST_GROUP, message='/x stat')
    logger.info('[LxBot Checker] Checking status now. Waiting for response.')
    flag = flag + 1

@on_natural_language('LxBot', only_short_message=False)
async def _(session: NLPSession):
    if session.ctx['group_id'] == TEST_GROUP:
        global flag
        flag = 0
        logger.info('[LxBot Checker] Response got. Currently online: ' + str(session.ctx['user_id']))
