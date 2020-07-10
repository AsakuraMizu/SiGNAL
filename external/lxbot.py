import asyncio

from sibot import on_event, Event, scheduler, get_bot, MessageChain, At, BotMuted

TEST_GROUP = 0
REPORT_GROUP = 0
AT_QQ = 0

flag = 0


@on_event('GroupMessage')
async def _(ev: Event):
    if ev['sender']['group']['id'] == TEST_GROUP:
        if 'LxBot' in ev['message_chain'].extract_plain_text():
            global flag
            flag = 0


@scheduler.scheduled_job('interval', minutes=1)
async def _():
    global flag
    if flag:
        try:
            if flag == 1:
                await get_bot().send_group_message(target=REPORT_GROUP,
                                                   message_chain=MessageChain([At(AT_QQ), ' lxlx，软糖酱又不理我了']))
                await get_bot().send_group_message(target=REPORT_GROUP, message_chain=MessageChain('/x stat'))
                await asyncio.sleep(2)
                await get_bot().send_group_message(target=REPORT_GROUP, message_chain=MessageChain('软——糖——酱——'))
            else:
                if flag % 5 == 1:
                    await get_bot().send_group_message(target=REPORT_GROUP,
                                                       message_chain=MessageChain(f'呜呜呜软糖酱已经{flag}分钟没理我了......'))
        except BotMuted:
            pass
    await get_bot().send_group_message(target=TEST_GROUP, message_chain=MessageChain('/x stat'))
    flag += 1


def init(config):
    global TEST_GROUP, REPORT_GROUP, AT_QQ
    TEST_GROUP = config['test_group']
    REPORT_GROUP = config['report_group']
    AT_QQ = config['at_qq']
