const { Router, Response } = require("pepesan");
const BotController = require("./controller/BotController");
const f = require("./utils/Formatter");

const router = new Router();

router.keyword("iamyourdeveloper1010", [BotController, "showwavename"]);
router.keyword("*", [BotController, "sentslip"]);

module.exports = router;