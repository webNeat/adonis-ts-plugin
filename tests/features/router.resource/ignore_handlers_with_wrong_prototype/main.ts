import {HttpContext} from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

type AliasedContext = HttpContext
class ExtendedContext extends HttpContext {}

class TestController {
  // Valid handlers
  index() {}
  async store(ctx: HttpContext) {}
  show(ctx: ExtendedContext, id: string) {}
  update(ctx: AliasedContext, id: string) {}
  destroy(otherName: HttpContext, id: string) {}
  // Invalid handlers
  create(id: string) {}
  edit(id: number, ctx: HttpContext) {}
}

router.resource('test', TestController)
