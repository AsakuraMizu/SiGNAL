from sibot import on_event, get_bot, Event


@on_event('NewFriendRequestEvent')
async def _(ev: Event):
    await get_bot().resp_new_friend(event_id=ev['event_id'], from_id=ev['from_id'], group_id=ev['group_id'], operate=0)


@on_event('BotInvitedJoinGroupRequestEvent')
async def _(ev: Event):
    await get_bot().resp_bot_invited_join_group(event_id=ev['event_id'],
                                                from_id=ev['from_id'],
                                                group_id=ev['group_id'],
                                                operate=0)
