import importlib
import pathlib
import re
from inspect import signature
from typing import Any, Dict, List, Optional, Tuple, Union

from .log import logger


def load_plugin(name: str, config: Optional[Dict[str, Any]] = None) -> bool:
    module = None
    for import_name in [name, f'sibot.builtin.{name}', f'external.{name}']:
        try:
            module = importlib.import_module(import_name)
            logger.info('Succeed to import "%s"', import_name)
        except ImportError:
            continue
        else:
            break
    else:
        logger.error('Failed to load plugin "%s"', name)
        return False
    if config and hasattr(module, 'init') and callable(module.init):
        try:
            if len(signature(module.init).parameters) == 0:
                module.init()
            else:
                module.init(config)
        except:
            logger.warning('Failed to initialize "%s"', name)
    return True


def load_plugins(path: str, prefix: str) -> int:
    res = 0
    for sub in pathlib.Path(path).iterdir():
        name = sub.name
        if sub.is_file() and (name.startswith('_') or not name.endswith('.py')):
            continue
        if sub.is_dir() and (name.startswith('_') or not (sub / '__init__.py').exists()):
            continue
        m = re.match(r'([_A-Z0-9a-z]+)(.py)?', name)
        if not m:
            continue
        res += load_plugin(f'{prefix}.{m.group(1)}')
    return res


def load_from_config(config: List[Union[str, Tuple[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]]) -> int:
    res = 0
    for plug in config:
        if isinstance(plug, str):
            res += load_plugin(plug)
        elif isinstance(plug, tuple):
            name, conf = plug
            res += load_plugin(name, conf)
        elif isinstance(plug, dict):
            res += load_from_config([(k, v) for k, v in plug.items()])
    return res
