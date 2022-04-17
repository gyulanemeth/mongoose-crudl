export default class NotFoundError extends Error {
  constructor (Model, filter) {
    super(`${Model.modelName} with ${JSON.stringify(filter)} is not found.`)
    this.status = 404
    this.name = 'NOT_FOUND'
  }
}
