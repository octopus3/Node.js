/*
 Navicat Premium Data Transfer

 Source Server         : 本机
 Source Server Type    : MySQL
 Source Server Version : 50722
 Source Host           : 127.0.0.1:3306
 Source Schema         : game_node

 Target Server Type    : MySQL
 Target Server Version : 50722
 File Encoding         : 65001

 Date: 16/12/2019 20:37:29
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for login_bonues
-- ----------------------------
DROP TABLE IF EXISTS `login_bonues`;
CREATE TABLE `login_bonues`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '登录奖励ID号',
  `uid` int(11) NULL DEFAULT 0 COMMENT '用户ID',
  `bonues` int(11) NULL DEFAULT 0 COMMENT '奖励为多少',
  `status` int(11) NULL DEFAULT 0 COMMENT '0表示未领取，1表示领取了',
  `bonues_time` int(11) NULL DEFAULT 0 COMMENT '上一次领取奖励的时间',
  `days` int(11) NULL DEFAULT 0 COMMENT '连续登录的天数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of login_bonues
-- ----------------------------
INSERT INTO `login_bonues` VALUES (1, 60, 100, 0, 1569089978, 1);
INSERT INTO `login_bonues` VALUES (2, 61, 100, 0, 1569141429, 1);
INSERT INTO `login_bonues` VALUES (3, 63, 100, 0, 1569158291, 1);
INSERT INTO `login_bonues` VALUES (4, 64, 100, 0, 1569158309, 1);
INSERT INTO `login_bonues` VALUES (5, 65, 100, 0, 1569158392, 1);
INSERT INTO `login_bonues` VALUES (6, 66, 100, 0, 1569158410, 1);
INSERT INTO `login_bonues` VALUES (7, 42, 100, 1, 1576083603, 1);
INSERT INTO `login_bonues` VALUES (8, 67, 100, 0, 1569159420, 1);
INSERT INTO `login_bonues` VALUES (9, 68, 100, 0, 1569336441, 1);
INSERT INTO `login_bonues` VALUES (10, 69, 100, 0, 1569336508, 1);
INSERT INTO `login_bonues` VALUES (11, 70, 100, 0, 1569336544, 1);
INSERT INTO `login_bonues` VALUES (12, 71, 100, 0, 1569336602, 1);
INSERT INTO `login_bonues` VALUES (13, 72, 100, 0, 1569336730, 1);
INSERT INTO `login_bonues` VALUES (14, 73, 100, 0, 1569337417, 1);
INSERT INTO `login_bonues` VALUES (15, 74, 100, 0, 1569337445, 1);
INSERT INTO `login_bonues` VALUES (16, 75, 100, 0, 1569337474, 1);
INSERT INTO `login_bonues` VALUES (17, 76, 100, 0, 1569337490, 1);
INSERT INTO `login_bonues` VALUES (18, 77, 100, 0, 1569339594, 1);
INSERT INTO `login_bonues` VALUES (19, 78, 100, 0, 1569339654, 1);
INSERT INTO `login_bonues` VALUES (20, 79, 100, 0, 1569339770, 1);
INSERT INTO `login_bonues` VALUES (21, 80, 100, 0, 1569340047, 1);
INSERT INTO `login_bonues` VALUES (22, 81, 100, 1, 1569340731, 1);
INSERT INTO `login_bonues` VALUES (23, 82, 100, 0, 1569657218, 1);
INSERT INTO `login_bonues` VALUES (24, 83, 100, 1, 1569657391, 1);
INSERT INTO `login_bonues` VALUES (25, 84, 100, 0, 1570103957, 1);
INSERT INTO `login_bonues` VALUES (26, 85, 100, 1, 1570104013, 1);
INSERT INTO `login_bonues` VALUES (27, 88, 100, 1, 1570203237, 1);
INSERT INTO `login_bonues` VALUES (28, 89, 100, 1, 1570203259, 1);
INSERT INTO `login_bonues` VALUES (29, 90, 100, 1, 1571468155, 1);
INSERT INTO `login_bonues` VALUES (30, 91, 100, 1, 1571469280, 1);
INSERT INTO `login_bonues` VALUES (31, 92, 100, 1, 1571469320, 1);
INSERT INTO `login_bonues` VALUES (32, 93, 100, 1, 1571471941, 1);
INSERT INTO `login_bonues` VALUES (33, 94, 100, 1, 1571555222, 1);
INSERT INTO `login_bonues` VALUES (34, 95, 100, 1, 1571555296, 1);
INSERT INTO `login_bonues` VALUES (35, 97, 100, 1, 1571555868, 1);
INSERT INTO `login_bonues` VALUES (36, 98, 100, 1, 1576083104, 1);
INSERT INTO `login_bonues` VALUES (37, 99, 100, 1, 1571558151, 1);

SET FOREIGN_KEY_CHECKS = 1;
