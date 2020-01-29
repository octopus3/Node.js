/*
 Navicat Premium Data Transfer

 Source Server         : 本机
 Source Server Type    : MySQL
 Source Server Version : 50722
 Source Host           : 127.0.0.1:3306
 Source Schema         : bycw_center

 Target Server Type    : MySQL
 Target Server Version : 50722
 File Encoding         : 65001

 Date: 16/12/2019 20:36:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for phone_chat
-- ----------------------------
DROP TABLE IF EXISTS `phone_chat`;
CREATE TABLE `phone_chat`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `phone` varchar(16) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `opt_type` int(11) NULL DEFAULT 0 COMMENT '操作类型0 游客升级1 修改密码2',
  `end_time` int(11) NULL DEFAULT NULL COMMENT '验证码时间戳',
  `count` int(11) NULL DEFAULT NULL COMMENT '拉取验证码的次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of phone_chat
-- ----------------------------
INSERT INTO `phone_chat` VALUES (3, '003840', '15975519780', 0, 1567608172, 1);
INSERT INTO `phone_chat` VALUES (5, '994974', '18011778941', 1, 1567849566, 9);
INSERT INTO `phone_chat` VALUES (6, '440154', '18011778941', 2, 1568633020, 4);
INSERT INTO `phone_chat` VALUES (7, '480401', '13360045902', 0, 1571558225, 4);

SET FOREIGN_KEY_CHECKS = 1;
