import router from '@adonisjs/core/services/router'

class TestController {
  protected index() {}
  private store() {}
  public show() {}
  #update() {}
  destroy() {}
}

router.resource('test', TestController).apiOnly()
