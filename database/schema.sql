-- FFFood POS Database Schema
CREATE DATABASE IF NOT EXISTS fffood_pos;
USE fffood_pos;

-- Categories
CREATE TABLE categories (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sub VARCHAR(100),
  sort_order INT DEFAULT 0
);

-- Menu Items
CREATE TABLE items (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category_id VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  tags JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Modifier Groups
CREATE TABLE modifier_groups (
  id VARCHAR(20) PRIMARY KEY,
  category_id VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_required TINYINT(1) DEFAULT 0,
  is_multi TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Modifier Options
CREATE TABLE modifier_options (
  id VARCHAR(20) PRIMARY KEY,
  group_id VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (group_id) REFERENCES modifier_groups(id)
);

-- Staff
CREATE TABLE staff (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  initials VARCHAR(5) NOT NULL,
  pin VARCHAR(10) NOT NULL,
  color VARCHAR(10) DEFAULT '#c4553c',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  staff_id VARCHAR(20),
  order_type ENUM('dine-in','takeaway','delivery') DEFAULT 'dine-in',
  table_number INT,
  guests INT DEFAULT 1,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status ENUM('open','paid','void','held') DEFAULT 'open',
  payment_method ENUM('cash','card','qr','split') NULL,
  tendered DECIMAL(10,2) NULL,
  change_due DECIMAL(10,2) NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Order Lines
CREATE TABLE order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id VARCHAR(20) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  note TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Order Line Modifiers
CREATE TABLE order_line_modifiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_line_id INT NOT NULL,
  modifier_name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (order_line_id) REFERENCES order_lines(id)
);

-- Inventory Adjustments Log
CREATE TABLE inventory_adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(20) NOT NULL,
  staff_id VARCHAR(20),
  reason ENUM('delivery','count','waste','sale') NOT NULL,
  qty_before INT NOT NULL,
  qty_change INT NOT NULL,
  qty_after INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories VALUES
('signatures','Signatures','House favourites',1),
('burgers','Burgers','Hand-pressed patties',2),
('pasta','Pasta','Fresh daily',3),
('bowls','Asian Bowls','Wok & rice',4),
('salads','Salads','Garden picks',5),
('breakfast','Breakfast','All day',6),
('coffee','Coffee','Single origin',7),
('drinks','Cold Drinks','Bottled & tap',8),
('desserts','Desserts','Made in-house',9);

INSERT INTO items VALUES
('s01','The Bistro Burger','signatures',16.50,24,'["bestseller"]',1,NOW(),NOW()),
('s02','Truffle Mushroom Pasta','signatures',18.00,12,'["chef"]',1,NOW(),NOW()),
('s03','Korean Fried Chicken','signatures',17.50,18,'["spicy"]',1,NOW(),NOW()),
('s04','Wagyu Rice Bowl','signatures',22.00,6,'["premium"]',1,NOW(),NOW()),
('b01','Cheese Burger','burgers',12.50,42,'[]',1,NOW(),NOW()),
('b02','Bacon Burger','burgers',14.00,28,'[]',1,NOW(),NOW()),
('b03','Veggie Burger','burgers',11.00,15,'["veg"]',1,NOW(),NOW()),
('b04','Pepperoni Melt','burgers',13.50,22,'[]',1,NOW(),NOW()),
('b05','Chicken Burger','burgers',12.00,19,'[]',1,NOW(),NOW()),
('b06','Fish Burger','burgers',13.00,8,'[]',1,NOW(),NOW()),
('p01','Spaghetti Carbonara','pasta',15.00,20,'[]',1,NOW(),NOW()),
('p02','Penne Arrabbiata','pasta',14.00,24,'["veg","spicy"]',1,NOW(),NOW()),
('p03','Lasagna al Forno','pasta',17.00,10,'[]',1,NOW(),NOW()),
('p04','Pesto Linguine','pasta',14.50,16,'["veg"]',1,NOW(),NOW()),
('n01','Pad Thai','bowls',14.00,22,'[]',1,NOW(),NOW()),
('n02','Beef Pho','bowls',15.50,14,'[]',1,NOW(),NOW()),
('n03','Teriyaki Chicken','bowls',14.50,26,'[]',1,NOW(),NOW()),
('n04','Bibimbap','bowls',15.00,18,'[]',1,NOW(),NOW()),
('n05','Ramen Tonkotsu','bowls',16.00,3,'[]',1,NOW(),NOW()),
('l01','Caesar Salad','salads',11.00,30,'[]',1,NOW(),NOW()),
('l02','Greek Salad','salads',11.50,22,'["veg"]',1,NOW(),NOW()),
('l03','Poké Bowl','salads',15.00,14,'[]',1,NOW(),NOW()),
('k01','Eggs Benedict','breakfast',14.00,18,'[]',1,NOW(),NOW()),
('k02','Avo Toast','breakfast',12.50,25,'["veg"]',1,NOW(),NOW()),
('k03','Pancake Stack','breakfast',13.00,20,'[]',1,NOW(),NOW()),
('k04','Full English','breakfast',16.50,12,'[]',1,NOW(),NOW()),
('c01','Espresso','coffee',3.50,200,'[]',1,NOW(),NOW()),
('c02','Flat White','coffee',4.50,200,'[]',1,NOW(),NOW()),
('c03','Cappuccino','coffee',4.50,200,'[]',1,NOW(),NOW()),
('c04','Latte','coffee',4.80,200,'[]',1,NOW(),NOW()),
('c05','Mocha','coffee',5.20,150,'[]',1,NOW(),NOW()),
('c06','Cold Brew','coffee',5.00,80,'[]',1,NOW(),NOW()),
('d01','Coca Cola','drinks',3.50,120,'[]',1,NOW(),NOW()),
('d02','Sparkling Water','drinks',3.00,80,'[]',1,NOW(),NOW()),
('d03','Fresh Orange','drinks',5.50,24,'[]',1,NOW(),NOW()),
('d04','Iced Lemon Tea','drinks',4.00,40,'[]',1,NOW(),NOW()),
('d05','Bubble Milk Tea','drinks',5.80,2,'[]',1,NOW(),NOW()),
('z01','Cheesecake Slice','desserts',7.50,8,'[]',1,NOW(),NOW()),
('z02','Tiramisu','desserts',8.00,6,'[]',1,NOW(),NOW()),
('z03','Brownie a la mode','desserts',8.50,10,'[]',1,NOW(),NOW()),
('z04','Fruit Tart','desserts',7.00,4,'[]',1,NOW(),NOW());

INSERT INTO modifier_groups VALUES
('burgers-size','burgers','Size',1,0,1),
('burgers-extras','burgers','Extras',0,1,2),
('burgers-sauce','burgers','Sauce',0,1,3),
('coffee-size','coffee','Size',1,0,1),
('coffee-milk','coffee','Milk',1,0,2),
('coffee-shot','coffee','Extras',0,1,3),
('bowls-base','bowls','Base',1,0,1),
('bowls-spice','bowls','Spice',1,0,2),
('bowls-extras','bowls','Extras',0,1,3),
('pasta-extras','pasta','Add',0,1,1);

INSERT INTO modifier_options VALUES
('bs-s','burgers-size','Regular',0.00,1),
('bs-m','burgers-size','Double patty',4.50,2),
('be-bacon','burgers-extras','Bacon',2.00,1),
('be-cheese','burgers-extras','Extra cheese',1.50,2),
('be-egg','burgers-extras','Fried egg',1.50,3),
('be-avo','burgers-extras','Avocado',2.50,4),
('bsc-bbq','burgers-sauce','BBQ',0.00,1),
('bsc-chip','burgers-sauce','Chipotle',0.50,2),
('bsc-truf','burgers-sauce','Truffle mayo',1.00,3),
('cs-s','coffee-size','Small',0.00,1),
('cs-m','coffee-size','Medium',0.80,2),
('cs-l','coffee-size','Large',1.50,3),
('cm-whole','coffee-milk','Whole',0.00,1),
('cm-oat','coffee-milk','Oat',0.80,2),
('cm-almond','coffee-milk','Almond',0.80,3),
('cm-skim','coffee-milk','Skim',0.00,4),
('ce-shot','coffee-shot','Extra shot',1.20,1),
('ce-syrup','coffee-shot','Vanilla syrup',0.80,2),
('ce-decaf','coffee-shot','Decaf',0.00,3),
('bb-rice','bowls-base','Jasmine rice',0.00,1),
('bb-brown','bowls-base','Brown rice',0.80,2),
('bb-noodles','bowls-base','Rice noodles',0.00,3),
('bsp-mild','bowls-spice','Mild',0.00,1),
('bsp-med','bowls-spice','Medium',0.00,2),
('bsp-hot','bowls-spice','Hot',0.00,3),
('bsp-thai','bowls-spice','Thai hot',0.00,4),
('bex-egg','bowls-extras','Soft egg',1.50,1),
('bex-prawn','bowls-extras','Extra prawns',4.00,2),
('pe-parm','pasta-extras','Parmesan',1.00,1),
('pe-chilli','pasta-extras','Chilli oil',0.50,2),
('pe-garlic','pasta-extras','Garlic bread',3.50,3);

INSERT INTO staff VALUES
('u1','Maya Chen','Manager','MC','1234','#c4553c',1,NOW()),
('u2','James Ortega','Cashier','JO','2345','#7a8c5c',1,NOW()),
('u3','Priya Nair','Server','PN','3456','#6b4a5e',1,NOW()),
('u4','Kenji Tanaka','Barista','KT','4567','#6b8aa8',1,NOW()),
('u5','Sara OConnell','Server','SO','5678','#d4a574',1,NOW());
