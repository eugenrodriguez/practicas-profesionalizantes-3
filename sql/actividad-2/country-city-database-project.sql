CREATE DATABASE  IF NOT EXISTS `actividad-1` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_bin */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `actividad-1`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: actividad-1
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8mb3_bin NOT NULL,
  `population` bigint NOT NULL,
  `area` double NOT NULL,
  `postal_code` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `is_coastal` tinyint NOT NULL,
  `country_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_city_country_idx` (`country_id`),
  CONSTRAINT `fk_city_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Buenos Aires',15000000,4000,'C1000',0,1),(2,'Córdoba',1600000,576,'X5000',0,1),(3,'Mar del Plata',700000,1453,'B7600',1,1),(4,'São Paulo',22000000,1521,'01000-000',0,2),(5,'Rio de Janeiro',6700000,1200,'20000-000',1,2),(6,'Salvador',2900000,693,'40000-000',1,2),(7,'Toronto',2900000,630,'M5V',0,3),(8,'Vancouver',675000,115,'V6B',1,3),(9,'Montreal',1700000,365,'H2L',0,3),(10,'Shanghai',26000000,6340,'200000',1,4),(11,'Beijing',21500000,16410,'100000',0,4),(12,'Guangzhou',15300000,7434,'510000',1,4),(13,'Copenhagen',630000,86,'1000',1,5),(14,'Aarhus',340000,91,'8000',1,5),(15,'Odense',180000,304,'5000',0,5),(16,'Cairo',9800000,528,'11511',0,6),(17,'Alexandria',5200000,2680,'21500',1,6),(18,'Luxor',500000,417,'85111',0,6),(19,'Paris',2140000,105,'75001',0,7),(20,'Marseille',860000,240,'13001',1,7),(21,'Lyon',510000,48,'69001',0,7),(22,'Berlin',3700000,891,'10115',0,8),(23,'Hamburg',1800000,755,'20095',1,8),(24,'Munich',1500000,310,'80331',0,8),(25,'Budapest',1750000,525,'1000',0,9),(26,'Debrecen',200000,290,'4000',0,9),(27,'Szeged',160000,281,'6700',0,9),(28,'Mumbai',20000000,603,'400001',1,10),(29,'Delhi',19000000,1484,'110001',0,10),(30,'Bengaluru',13000000,709,'560001',0,10),(31,'Tokyo',13900000,2190,'100-0001',1,11),(32,'Osaka',2700000,225,'530-0001',1,11),(33,'Kyoto',1500000,827,'600-0000',0,11),(34,'Nairobi',4400000,696,'00100',0,12),(35,'Mombasa',1200000,295,'80100',1,12),(36,'Kisumu',500000,175,'40100',0,12),(37,'Luxembourg City',125000,51,'1009',0,13),(38,'Esch-sur-Alzette',35000,14,'4001',0,13),(39,'Differdange',27000,18,'4501',0,13),(40,'Mexico City',9200000,1485,'01000',0,14),(41,'Guadalajara',5200000,151,'44100',0,14),(42,'Cancún',880000,197,'77500',1,14),(43,'Amsterdam',870000,219,'1000AA',0,15),(44,'Rotterdam',650000,325,'3000AA',0,15),(45,'The Hague',540000,98,'2500AA',1,15),(46,'Muscat',1400000,3500,'113',1,16),(47,'Salalah',350000,650,'211',1,16),(48,'Sohar',200000,170,'311',1,16),(49,'Lima',10000000,2672,'15001',1,17),(50,'Arequipa',1100000,2900,'04001',0,17),(51,'Trujillo',900000,110,'13001',1,17),(52,'Doha',2400000,132,'1234',1,18),(53,'Al Rayyan',800000,200,'5678',0,18),(54,'Umm Salal',120000,318,'9012',0,18),(55,'Moscow',12500000,2511,'101000',0,19),(56,'Saint Petersburg',5400000,1439,'190000',1,19),(57,'Novosibirsk',1600000,503,'630000',0,19),(58,'Madrid',6700000,604,'28001',0,20),(59,'Barcelona',5600000,101,'08001',1,20),(60,'Seville',700000,140,'41001',0,20),(61,'Istanbul',15500000,5461,'34000',1,21),(62,'Ankara',5600000,2516,'06000',0,21),(63,'Izmir',4400000,11891,'35000',1,21),(64,'Kampala',1600000,290,'00256',0,22),(65,'Gulu',170000,100,'00256',0,22),(66,'Entebbe',80000,56,'00256',0,22),(67,'Ho Chi Minh City',9000000,2095,'70000',0,23),(68,'Hanoi',8000000,3359,'10000',0,23),(69,'Da Nang',1100000,1256,'55000',1,23),(70,'Sana\'a',2800000,200,'12345',0,24),(71,'Aden',900000,760,'12346',1,24),(72,'Taiz',600000,100,'12347',0,24),(73,'Harare',1600000,960,'00263',0,25),(74,'Bulawayo',650000,1706,'00263',0,25),(75,'Chitungwiza',360000,37,'00263',0,25),(76,'Sydney',5300000,12368,'2000',1,26),(77,'Melbourne',5000000,9993,'3000',1,26),(78,'Brisbane',2500000,15826,'4000',1,26),(79,'Brussels',1200000,161,'1000',0,27),(80,'Antwerp',520000,204,'2000',0,27),(81,'Ghent',260000,156,'9000',0,27),(82,'Santiago',6000000,641,'8320000',0,28),(83,'Valparaíso',300000,400,'2340000',1,28),(84,'Concepción',220000,222,'4030000',0,28),(85,'Helsinki',650000,715,'00100',1,29),(86,'Tampere',240000,689,'33100',0,29),(87,'Turku',190000,306,'20100',1,29),(88,'Athens',3100000,412,'10551',1,30),(89,'Thessaloniki',800000,19,'54621',1,30),(90,'Patras',200000,335,'26000',1,30);
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8mb3_bin NOT NULL,
  `capital` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `language` varchar(45) COLLATE utf8mb3_bin NOT NULL,
  `area` double NOT NULL,
  `population` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
INSERT INTO `country` VALUES (1,'Argentina','Buenos Aires','Spanish',2780000,45195777),(2,'Brazil','Brasilia','Portuguese',8515767,212559417),(3,'Canada','Ottawa','English/French',9984670,37742154),(4,'China','Beijing','Chinese',9596961,1439323776),(5,'Denmark','Copenhagen','Danish',43094,5831404),(6,'Egypt','Cairo','Arabic',1002450,102334404),(7,'France','Paris','French',551695,65273511),(8,'Germany','Berlin','German',357022,83783942),(9,'Hungary','Budapest','Hungarian',93028,9660351),(10,'India','New Delhi','Hindi/English',3287263,1380004385),(11,'Japan','Tokyo','Japanese',377975,126476461),(12,'Kenya','Nairobi','Swahili/English',580367,53771296),(13,'Luxembourg','Luxembourg','Luxembourgish',2586,625978),(14,'Mexico','Mexico City','Spanish',1964375,128932753),(15,'Netherlands','Amsterdam','Dutch',41543,17134872),(16,'Oman','Muscat','Arabic',309500,5106626),(17,'Peru','Lima','Spanish',1285216,32971854),(18,'Qatar','Doha','Arabic',11586,2881053),(19,'Russia','Moscow','Russian',17098242,145934462),(20,'Spain','Madrid','Spanish',505990,46754778),(21,'Turkey','Ankara','Turkish',783562,84339067),(22,'Uganda','Kampala','English/Swahili',241038,45741007),(23,'Vietnam','Hanoi','Vietnamese',331212,97338579),(24,'Yemen','Sana\'a','Arabic',527968,29825964),(25,'Zimbabwe','Harare','English/Shona',390757,14862924),(26,'Australia','Canberra','English',7692024,25499884),(27,'Belgium','Brussels','Dutch/French/German',30528,11589623),(28,'Chile','Santiago','Spanish',756102,19116201),(29,'Finland','Helsinki','Finnish/Swedish',338424,5540720),(30,'Greece','Athens','Greek',131957,10423054);
/*!40000 ALTER TABLE `country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'actividad-1'
--

--
-- Dumping routines for database 'actividad-1'
--
/*!50003 DROP PROCEDURE IF EXISTS `city_create` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `city_create`(
    IN p_name VARCHAR(45),
    IN p_population BIGINT,
    IN p_area DOUBLE,
    IN p_postal_code VARCHAR(45),
    IN p_is_coastal TINYINT,
    IN p_country_id INT
)
BEGIN
    INSERT INTO city (name, population, area, postal_code, is_coastal, country_id)
    VALUES (p_name, p_population, p_area, p_postal_code, p_is_coastal, p_country_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `city_delete_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `city_delete_by_id`(
    IN p_id INT
)
BEGIN
    DELETE FROM city WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `city_get_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `city_get_by_id`(
    IN p_id INT
)
BEGIN
    SELECT 
        id, 
        name, 
        population, 
        area, 
        postal_code, 
        is_coastal, 
        country_id
    FROM 
        city 
    WHERE 
        id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `city_update_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `city_update_by_id`(
    IN p_id INT,
    IN p_name VARCHAR(45),
    IN p_population BIGINT,
    IN p_area DOUBLE,
    IN p_postal_code VARCHAR(45),
    IN p_is_coastal TINYINT,
    IN p_country_id INT
)
BEGIN
    UPDATE city
    SET
        name = p_name,
        population = p_population,
        area = p_area,
        postal_code = p_postal_code,
        is_coastal = p_is_coastal,
        country_id = p_country_id
    WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `country_create` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `country_create`(
  IN p_name VARCHAR(45),
  IN p_capital VARCHAR(45),
  IN p_language VARCHAR(45),
  IN p_area DOUBLE,
  IN p_population BIGINT
)
BEGIN
  INSERT INTO country (name, capital, language, area, population)
  VALUES (p_name, p_capital, p_language, p_area, p_population);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `country_delete_by_name` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `country_delete_by_name`(IN p_name VARCHAR(45))
BEGIN
  DELETE FROM country WHERE name = p_name;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `country_get_by_name` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `country_get_by_name`(IN p_name VARCHAR(45))
BEGIN
  SELECT * FROM country WHERE name = p_name;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `country_update_by_name` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `country_update_by_name`(
  IN p_name VARCHAR(45),
  IN p_capital VARCHAR(45),
  IN p_language VARCHAR(45),
  IN p_area DOUBLE,
  IN p_population BIGINT
)
BEGIN
  UPDATE country
  SET capital = p_capital,
      language = p_language,
      area = p_area,
      population = p_population
  WHERE name = p_name;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_city_with_highest_density` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_city_with_highest_density`()
BEGIN
    SELECT
        city.name,
        country.name,
        (city.population / city.area)
    FROM
        city
    JOIN
        country ON city.country_id = country.id
    WHERE
        city.area > 0
    ORDER BY
        (city.population / city.area) DESC
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_countries_with_large_coastal_cities` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_countries_with_large_coastal_cities`()
BEGIN
    SELECT DISTINCT
        country.id,
        country.name
    FROM
        country
    JOIN
        city ON country.id = city.country_id
    WHERE
        city.is_coastal = 1 AND city.population > 1000000;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_country_of_most_populous_city` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_country_of_most_populous_city`()
BEGIN
    SELECT
        city.name,
        city.population,
        country.name
    FROM
        city
    JOIN
        country ON city.country_id = country.id
    ORDER BY
        city.population DESC
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-05 21:21:12
