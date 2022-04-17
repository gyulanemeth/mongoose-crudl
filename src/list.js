export default async function list (Model, params = {}, query = {}) {
  const filter = query.filter || {}
  const select = query.select || {}
  let skip = query.skip || 0
  let limit = query.limit || 10
  const sort = query.sort || { createdAt: -1 }

  Object.assign(filter, params)

  if (typeof skip === 'string') {
    skip = parseInt(skip)
  }

  if (typeof limit === 'string') {
    limit = parseInt(limit)
  }

  const [items, count] = await Promise.all([
    Model.find(filter).select(select).sort(sort).skip(skip).limit(limit),
    Model.count(filter)
  ])

  return {
    status: 200,
    result: {
      items: items.map(item => item.toObject()),
      count
    }
  }
}
