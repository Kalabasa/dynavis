-- phpMyAdmin SQL Dump
-- version 4.4.12deb1
-- http://www.phpmyadmin.net
--
-- Host: 
-- Generation Time: Aug 19, 2015 at 09:42 PM
-- Server version: 
-- PHP Version: 

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dynavis`
--

-- --------------------------------------------------------

--
-- Table structure for table `area`
--

CREATE TABLE IF NOT EXISTS `area` (
  `id` int(11) NOT NULL,
  `code` int(9) NOT NULL,
  `name` varchar(48) COLLATE utf8_unicode_ci NOT NULL,
  `type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `datapoint`
--

CREATE TABLE IF NOT EXISTS `datapoint` (
  `id` int(11) NOT NULL,
  `dataset_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `area_code` int(11) NOT NULL,
  `value` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dataset`
--

CREATE TABLE IF NOT EXISTS `dataset` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `name` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `elect`
--

CREATE TABLE IF NOT EXISTS `elect` (
  `id` int(11) NOT NULL,
  `official_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `year_end` int(11) NOT NULL,
  `position` varchar(48) COLLATE utf8_unicode_ci DEFAULT NULL,
  `votes` int(11) DEFAULT NULL,
  `area_code` int(11) NOT NULL,
  `party_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family`
--

CREATE TABLE IF NOT EXISTS `family` (
  `id` int(11) NOT NULL,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family_membership`
--

CREATE TABLE IF NOT EXISTS `family_membership` (
  `official_id` int(11) NOT NULL,
  `family_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `official`
--

CREATE TABLE IF NOT EXISTS `official` (
  `id` int(11) NOT NULL,
  `surname` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(48) COLLATE utf8_unicode_ci NOT NULL,
  `nickname` varchar(24) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `party`
--

CREATE TABLE IF NOT EXISTS `party` (
  `id` int(11) NOT NULL,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tag_datapoint`
--

CREATE TABLE IF NOT EXISTS `tag_datapoint` (
  `id` int(11) NOT NULL,
  `dataset_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `area_code` int(11) NOT NULL,
  `family_id` int(11) NOT NULL,
  `value` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE IF NOT EXISTS `token` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` char(128) COLLATE utf8_unicode_ci NOT NULL,
  `expiry` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL,
  `username` varchar(48) COLLATE utf8_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `pw_hash` char(60) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `type` int(11) NOT NULL,
  `salt` char(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `datapoint`
--
ALTER TABLE `datapoint`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dataset_id` (`dataset_id`),
  ADD KEY `area_code` (`area_code`);

--
-- Indexes for table `dataset`
--
ALTER TABLE `dataset`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `elect`
--
ALTER TABLE `elect`
  ADD PRIMARY KEY (`id`),
  ADD KEY `official_id` (`official_id`),
  ADD KEY `area_code` (`area_code`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `family`
--
ALTER TABLE `family`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `family_membership`
--
ALTER TABLE `family_membership`
  ADD PRIMARY KEY (`official_id`,`family_id`),
  ADD KEY `official_id` (`official_id`),
  ADD KEY `family_membership_ibfk_2` (`family_id`);

--
-- Indexes for table `official`
--
ALTER TABLE `official`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Fullname` (`surname`,`name`,`nickname`);

--
-- Indexes for table `party`
--
ALTER TABLE `party`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tag_datapoint`
--
ALTER TABLE `tag_datapoint`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dataset_id` (`dataset_id`),
  ADD KEY `area_code` (`area_code`),
  ADD KEY `family_id` (`family_id`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `area`
--
ALTER TABLE `area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `datapoint`
--
ALTER TABLE `datapoint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `dataset`
--
ALTER TABLE `dataset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `elect`
--
ALTER TABLE `elect`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `family`
--
ALTER TABLE `family`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `official`
--
ALTER TABLE `official`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `party`
--
ALTER TABLE `party`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tag_datapoint`
--
ALTER TABLE `tag_datapoint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `datapoint`
--
ALTER TABLE `datapoint`
  ADD CONSTRAINT `datapoint_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `datapoint_ibfk_2` FOREIGN KEY (`area_code`) REFERENCES `area` (`code`) ON UPDATE CASCADE;

--
-- Constraints for table `dataset`
--
ALTER TABLE `dataset`
  ADD CONSTRAINT `dataset_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `elect`
--
ALTER TABLE `elect`
  ADD CONSTRAINT `elect_ibfk_1` FOREIGN KEY (`official_id`) REFERENCES `official` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `elect_ibfk_3` FOREIGN KEY (`party_id`) REFERENCES `party` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `elect_ibfk_4` FOREIGN KEY (`area_code`) REFERENCES `area` (`code`) ON UPDATE CASCADE;

--
-- Constraints for table `family_membership`
--
ALTER TABLE `family_membership`
  ADD CONSTRAINT `family_membership_ibfk_1` FOREIGN KEY (`official_id`) REFERENCES `official` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_membership_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `family` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tag_datapoint`
--
ALTER TABLE `tag_datapoint`
  ADD CONSTRAINT `tag_datapoint_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tag_datapoint_ibfk_3` FOREIGN KEY (`family_id`) REFERENCES `family` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tag_datapoint_ibfk_4` FOREIGN KEY (`area_code`) REFERENCES `area` (`code`) ON UPDATE CASCADE;

--
-- Constraints for table `token`
--
ALTER TABLE `token`
  ADD CONSTRAINT `token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
