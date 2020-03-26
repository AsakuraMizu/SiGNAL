from os import environ

from utils import parse


try:
    import config as _conf
except ModuleNotFoundError:
    import sys
    sys.exit('Error: config.py NOT found!')
except ImportError:
    import sys
    sys.exit('An error occurred while processing. Please check your config.py file!')


for k, v in environ.items():
    if k.startswith('NONEBOT_'):
        setattr(_conf, k.replace('NONEBOT_', '', 1), parse(v))

def get_conf():
    return _conf
