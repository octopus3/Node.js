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

 Date: 16/12/2019 20:37:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ugame
-- ----------------------------
DROP TABLE IF EXISTS `ugame`;
CREATE TABLE `ugame`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ugame表内的唯一id号',
  `uid` int(11) NULL DEFAULT NULL COMMENT '用户id号',
  `uexp` int(11) NULL DEFAULT NULL COMMENT '用户的经验值',
  `status` int(11) NULL DEFAULT 0 COMMENT '0为正常，1位非法数据记录',
  `uchip` int(11) NULL DEFAULT NULL COMMENT '金币值',
  `udata` int(11) NULL DEFAULT NULL COMMENT '游戏统计数据',
  `uvip` int(11) NULL DEFAULT 0 COMMENT '游戏VIP标识',
  `uvip_endtime` int(11) NULL DEFAULT 0 COMMENT '时间结束的时间戳',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 41 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ugame
-- ----------------------------
INSERT INTO `ugame` VALUES (1, 58, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (2, 59, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (3, 60, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (4, 61, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (5, 62, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (6, 63, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (7, 64, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (8, 65, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (9, 66, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (10, 42, 1000, 0, 7013, NULL, 0, 0);
INSERT INTO `ugame` VALUES (11, 67, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (12, 68, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (13, 69, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (14, 70, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (15, 71, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (16, 72, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (17, 73, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (18, 74, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (19, 75, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (20, 76, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (21, 77, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (22, 78, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (23, 79, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (24, 80, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (25, 81, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (26, 82, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (27, 83, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (28, 84, 1000, 0, 1000, NULL, 0, 0);
INSERT INTO `ugame` VALUES (29, 85, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (30, 88, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (31, 89, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (32, 90, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (33, 91, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (34, 92, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (35, 93, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (36, 94, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (37, 95, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (38, 97, 1000, 0, 1100, NULL, 0, 0);
INSERT INTO `ugame` VALUES (39, 98, 1000, 0, 3787, NULL, 0, 0);
INSERT INTO `ugame` VALUES (40, 99, 1000, 0, 1100, NULL, 0, 0);

SET FOREIGN_KEY_CHECKS = 1;
