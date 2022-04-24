export default async function deleteMany (Model, params) {
  const filter = Object.assign({}, params)

  const result = await Model.deleteMany(filter)

  return {
    status: 200,
    result: result
  }
}
