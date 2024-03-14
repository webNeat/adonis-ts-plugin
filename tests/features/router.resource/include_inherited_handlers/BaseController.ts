import {HttpContext} from '@adonisjs/core/http'

export class BaseController {
  // Valid handlers
  index() {}
  async create() {}
  async show(ctx: HttpContext) {}

  // Invalid handler
  edit(id: string) {}
  protected destroy() {}
}
