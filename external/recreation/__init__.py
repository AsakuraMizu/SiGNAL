from sibot import load_plugins
from pathlib import Path

load_plugins(Path(__file__).parent, __name__)
