from typing import Any, Dict, List, Optional, Tuple, Union

from pydantic import BaseModel, AnyHttpUrl, Extra, SecretStr


class Mongo(BaseModel):
    host: Optional[str] = 'db'
    port: Optional[int] = 27017
    username: Optional[str] = ''
    password: Optional[SecretStr] = ''
    db: Optional[str] = 'bot'


class Config(BaseModel):
    # general
    debug: Optional[bool] = False
    admin: Optional[List[int]] = []

    # http api
    api_root: AnyHttpUrl
    auth_key: SecretStr
    qq: int

    # receiver
    ping_timeout: Optional[float] = 5
    sleep_time: Optional[float] = 5

    # command
    prefix: Optional[Union[str, List[str]]] = '/'

    # db
    mongo: Optional[Mongo]

    # plugins
    plugins: Optional[List[Union[str, Tuple[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]]] = []

    class Config:
        extra = Extra.ignore
