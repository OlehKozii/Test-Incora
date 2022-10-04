const Router = require("express")

const userController = require("../controllers/userController")
const checkAuth = require("../middleware/checkAuth")

const router = new Router()

router.post("/users/register", userController.register)
router.post("/users/login", userController.login)
router.patch("/users/refresh", checkAuth, userController.refresh)
router.get("/users/getUser/:id", checkAuth, userController.getOne)
router.post("/users/getCode/:id", userController.getCode)
router.patch("/users/:id", userController.update)

module.exports = router