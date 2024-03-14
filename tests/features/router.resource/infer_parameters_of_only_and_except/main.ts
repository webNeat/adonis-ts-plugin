import router from '@adonisjs/core/services/router'

class TestController {
  index() {}
  public show() {}
}

const handlers = ['index', 'show'] as ['index', 'show']
const show = 'show' as const

router.resource('test1', TestController).only(['index', 'show'])
router.resource('test2', TestController).only(['index', show])
router.resource('test3', TestController).only(handlers)
router.resource('test4', TestController).only([...handlers, 'create'])
