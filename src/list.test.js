import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'

import { list } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('list', () => {
  beforeAll(async () => {
    await mongooseMemoryServer.start()
    await mongooseMemoryServer.connect('test-db')
  })
  afterEach(async () => {
    await mongooseMemoryServer.purge()
  })
  afterAll(async () => {
    await mongooseMemoryServer.disconnect()
    await mongooseMemoryServer.stop()
  })

  test('empty list', async () => {
    const res = await list(TestModel)

    expect(res).toEqual({
      status: 200,
      result: {
        items: [],
        count: 0
      }
    })
  })

  test('empty list with params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const searchRefId = new mongoose.Types.ObjectId()

    const res = await list(TestModel, { refId: searchRefId }, {})

    expect(res).toEqual({
      status: 200,
      result: {
        items: [],
        count: 0
      }
    })
  })

  test('list with params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const refId2 = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const test2 = new TestModel({ name: 'test2', refId2 })
    await test2.save()

    const test3 = new TestModel({ name: 'test3', refId })
    await test3.save()

    const res = await list(TestModel, { refId }, {})

    expect(res).toEqual({
      status: 200,
      result: {
        items: [
          {
            __v: 0,
            _id: test3._id,
            refId: refId,
            name: test3.name,
            createdAt: test3.createdAt,
            updatedAt: test3.updatedAt
          },
          {
            __v: 0,
            _id: test._id,
            refId: refId,
            name: test.name,
            createdAt: test.createdAt,
            updatedAt: test.updatedAt
          }
        ],
        count: 2
      }
    })
  })

  test('sort', async () => {
    const refId = new mongoose.Types.ObjectId()
    const refId2 = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const test2 = new TestModel({ name: 'test2', refId2 })
    await test2.save()

    const test3 = new TestModel({ name: 'test3', refId })
    await test3.save()

    const res = await list(TestModel, { refId }, { sort: { createdAt: 1 } })

    expect(res).toEqual({
      status: 200,
      result: {
        items: [
          {
            __v: 0,
            _id: test._id,
            refId: refId,
            name: test.name,
            createdAt: test.createdAt,
            updatedAt: test.updatedAt
          },
          {
            __v: 0,
            _id: test3._id,
            refId: refId,
            name: test3.name,
            createdAt: test3.createdAt,
            updatedAt: test3.updatedAt
          }
        ],
        count: 2
      }
    })
  })

  test('sort with skip & limit', async () => {
    const refId = new mongoose.Types.ObjectId()
    const refId2 = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'Apple', refId })
    await test.save()

    const test2 = new TestModel({ name: 'appLe', refId2 })
    await test2.save()

    const test3 = new TestModel({ name: 'Apple and Pear', refId })
    await test3.save()

    const test4 = new TestModel({ name: 'Pear and APPLE', refId })
    await test4.save()

    const test5 = new TestModel({ name: 'Carrot', refId })
    await test5.save()

    const test6 = new TestModel({ name: 'app pear le', refId })
    await test6.save()

    const res = await list(TestModel, { refId }, { sort: { createdAt: 1 }, limit: '2', skip: '1' })

    expect(res).toEqual({
      status: 200,
      result: {
        items: [
          {
            __v: 0,
            _id: test3._id,
            refId: refId,
            name: test3.name,
            createdAt: test3.createdAt,
            updatedAt: test3.updatedAt
          },
          {
            __v: 0,
            _id: test4._id,
            refId: refId,
            name: test4.name,
            createdAt: test4.createdAt,
            updatedAt: test4.updatedAt
          }
        ],
        count: 5
      }
    })
  })

  test('filter & sort with skip & limit', async () => {
    const refId = new mongoose.Types.ObjectId()
    const refId2 = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'Apple', refId })
    await test.save()

    const test2 = new TestModel({ name: 'appLe', refId2 })
    await test2.save()

    const test3 = new TestModel({ name: 'Apple and Pear', refId })
    await test3.save()

    const test4 = new TestModel({ name: 'Pear and APPLE', refId })
    await test4.save()

    const test5 = new TestModel({ name: 'Carrot', refId })
    await test5.save()

    const test6 = new TestModel({ name: 'app pear le', refId })
    await test6.save()

    const res = await list(TestModel, { refId }, {
      filter: { name: { $regex: 'pear', $options: 'gi' } },
      sort: { createdAt: 1 },
      limit: 2,
      skip: 1
    })

    expect(res).toEqual({
      status: 200,
      result: {
        items: [
          {
            __v: 0,
            _id: test4._id,
            refId: refId,
            name: test4.name,
            createdAt: test4.createdAt,
            updatedAt: test4.updatedAt
          },
          {
            __v: 0,
            _id: test6._id,
            refId: refId,
            name: test6.name,
            createdAt: test6.createdAt,
            updatedAt: test6.updatedAt
          }
        ],
        count: 3
      }
    })
  })
})
