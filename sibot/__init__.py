import nonebot
import sibot.addons

from json_config import connect
uconf = connect('config.json')
uconf.serializer_indent = 4
uconf.serializer_sort_keys = False

from nonebot import default_config as _conf

from os import environ
from sibot.utils import parse
for k, v in environ.items():
    if k.startswith('NONEBOT_'):
        setattr(_conf, k.replace('NONEBOT_', '', 1), parse(v))

for k, v in uconf['nonebot'].items():
    setattr(_conf, k.upper(), v)

nonebot.init(_conf)

import re
for p in uconf['plugins']:
    p = re.sub('^@', 'sibot.plugins.', p)
    nonebot.load_plugin(p)

app = nonebot.get_bot().asgi

def run():
    nonebot.run(use_reloader=True)
