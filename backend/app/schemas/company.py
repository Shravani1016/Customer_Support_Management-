from pydantic import BaseModel, field_validator

from typing import Optional

from datetime import datetime



class CompanyCreate(BaseModel):

    name: str

    industry: Optional[str] = None

    website: Optional[str] = None

    phone: Optional[str] = None

    address: Optional[str] = None



    @field_validator('phone')

    @classmethod

    def phone_must_be_10_digits(cls, v):

        if v and (not v.isdigit() or len(v) != 10):

            raise ValueError('Phone must be exactly 10 digits')

        return v



class CompanyUpdate(BaseModel):

    name: Optional[str] = None

    industry: Optional[str] = None

    website: Optional[str] = None

    phone: Optional[str] = None

    address: Optional[str] = None



    @field_validator('phone')

    @classmethod

    def phone_must_be_10_digits(cls, v):

        if v and (not v.isdigit() or len(v) != 10):

            raise ValueError('Phone must be exactly 10 digits')

        return v



class CompanyResponse(BaseModel):

    id: int

    name: str

    industry: Optional[str]

    website: Optional[str]

    phone: Optional[str]

    address: Optional[str]

    created_at: datetime



    class Config:

        from_attributes = True
