import importlib
import pathlib
import re

from .log import logger


def load_plugin(name: str) -> bool:
    name = re.sub(r'^@', 'sibot.plugins.', name)
    try:
        module = importlib.import_module(name)
        logger.info('Succeed to import "%s"', name)
        return True
    except:
        logger.exception('Failed to import "%s"', name)
        return False


def load_plugins(dir: str, prefix: str) -> int:
    count = 0
    for sub in pathlib.Path(dir).iterdir():
        name = sub.name
        if sub.is_file() and (name.startswith('_') or not name.endswith('.py')):
            continue
        if sub.is_dir() and (name.startswith('_') or not (sub / '__init__.py').exists()):
            continue
        m = re.match(r'([_A-Z0-9a-z]+)(.py)?', name)
        if not m:
            continue
        res = load_plugin(f'{prefix}.{m.group(1)}')
        if res:
            count += 1
    return count
