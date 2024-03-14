import router from '@adonisjs/core/services/router'
import {CustomController} from './CustomController.js'

class ExtendedController extends CustomController {
  store() {}
}

router.resource('test', CustomController)
router.resource('extended', ExtendedController)
