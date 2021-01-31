CREATE TABLE Orders( OrderId int NOT NULL, CustomerName VARCHAR(50), CustomerEmail VARCHAR(50), CustomerPhone VARCHAR(30), CustomerStreet VARCHAR(50), CustomerCity VARCHAR(30), CustomerType CHAR(3), CustomerMarket CHAR(2), OrderedProducts VARCHAR(200), TotalPrice int, DeliveryTime VARCHAR(13), Status VARCHAR(16), OrgNumber VARCHAR(20), TestId int, UNIQUE (OrderId) );