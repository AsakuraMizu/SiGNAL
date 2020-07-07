import logging

logger = logging.getLogger('sibot')
logger.setLevel(logging.INFO)

DEBUG_LOGGERS = [
    'aiomirai',
    'apscheduler',
    'sibot'
]
