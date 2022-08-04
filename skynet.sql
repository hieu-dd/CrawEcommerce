-- INSERT
INSERT INTO platforms(id,"name") VALUES(1,'tiki');
INSERT INTO products(id,name,platform_id,shop_id,description,url,brand,price,price_before_discount) VALUES(11347711,'San pham dau tien',1,null,'Test san p','url','brand',100000,100000)

-- Create table
CREATE TABLE platforms (
  id integer,
  name text,
  created_at timestamp NOT NULL default now(),
  updated_at timestamp NOT NULL default now(),
  deleted_at timestamp,

  CONSTRAINT platforms__pk PRIMARY KEY (id)
);

CREATE TABLE products (
  id integer,
  name text,
  platform_id integer,
  shop_id text,
  description text,
  url text,
  brand text,
  price float,
  price_before_discount float,
  created_at timestamp NOT NULL default now(),
  updated_at timestamp NOT NULL default now(),
  deleted_at timestamp,

  CONSTRAINT products__pk PRIMARY KEY (id),
  CONSTRAINT products_platform_id__fk FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE attibutes (
  id integer,
  product_id integer,
  name text,
  value text,
  created_at timestamp NOT NULL default now(),
  updated_at timestamp NOT NULL default now(),
  deleted_at timestamp,

  CONSTRAINT attibutes__pk PRIMARY KEY (id),
  CONSTRAINT attibutes_product_id__fk FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_images (
  id integer,
  url text,
  product_id integer,
  created_at timestamp NOT NULL default now(),
  updated_at timestamp NOT NULL default now(),
  deleted_at timestamp,

  CONSTRAINT product_images__pk PRIMARY KEY (id),
  CONSTRAINT product_images_product_id__fk FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create db
SELECT datname FROM pg_database;
SELECT ‘CREATE DATABASE myNewDB’ WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = ‘myNewDB’)\gexec