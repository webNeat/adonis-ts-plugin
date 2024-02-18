import router from '@adonisjs/core/services/router'

class TestController {}

router.resource('test', TestController)
