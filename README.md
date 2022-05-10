# mongoose-crudl

CRUDL operations for Mongoose: Create, Read, Update, Delete, & List.

## Installation

```
npm i --save mongoose-crudl
```

## Usage

The following functions are exported in the `index.js` file:
```javascript
import { list, createOne, readOne updateOne, deleteOne, deleteMany } from 'mongoose-crudl'
```

These functions are asynchronous by nature, so they return a Javascript promise.

In the following examples, we are going to use `async` and `await`, and we assume you will do the same in your code. That is why, whenever the promise returned by the function resolves something, we will refer it to as the function returns that value. Whenever the promise returned by the function rejects something, we will refer it as the function throws an error.

## Common parameters

The first two parameters of all of the functions in this lib are the same. The first one is the 'Model' and the second is called 'params'.

### Model

All of these functions operate on a Mongoose model, and you have to pass the model as the first argument for all of these functions.

### Params

The second parameter for all of the functions in this lib is an object called params. The properties on this objects are intended to be property names in your Mongoose model, and the values are most likely Mongoose ObjectId-s (or the string representation of them).

The properties of the params object are always merged into the filter object, and in case of createOne & updateOne, they are merged into the data object that is sent to the database.

In order to use this lib efficiently, you should add all of the related ids to your Mongoose model. For example, let's say that you have model A, model B, and model C. Model A and B are in a 1-N relationship, model B and C are also in a 1-N relationship. In this case, you will have to put a reference of A into C:

```javascript
import mongoose from 'mongoose'

const aSchema = new mongoose.Schema({
  name: { type: String, required: true }
})
const aModel = mongoose.model('A', aSchema)

const bSchema = new mongoose.Schema({
  aId: { type: mongoose.Schema.ObjectId, ref: 'A', required: true },

  name: { type: String, required: true }
})
const bModel = mongoose.model('B', bSchema)

const cSchema = new mongoose.Schema({
  aId: { type: mongoose.Schema.ObjectId, ref: 'A', required: true },
  bId: { type: mongoose.Schema.ObjectId, ref: 'B', required: true },

  name: { type: String, required: true }
})
const cModel = mongoose.model('C', cSchema)

```

Wondering why we call this object params? It comes from express' naming convention. There, you reach the URL params on the `req.params` object, which you always should add to your filter if the name of the params are equal to the property names in your model. So, if I want to create a route in express for `cModel` in my example above, then the route will be the following: `/v1/a/:aId/b/:bId/c`, so `req.params` will contain `aId` and `bId`. (And you definitely want to add those fields to your filter.)

## Functions

In the following section, you can read about the CRUDL functions exported by this lib.

### list(Model, params, query)

A function for querying your collection.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).
query | Object | A query object, described below.
query.filter | Object | A Mongoose filter object, that can be applied to [Model.find()](https://mongoosejs.com/docs/api.html#model_Model.find).
query.select | Object | A [Mongoose select object](https://mongoosejs.com/docs/api.html#query_Query-select). Be careful, use the object syntax, not the array / string syntax!
query.sort | Object | A [Mongoose sort object](https://mongoosejs.com/docs/api.html#query_Query-sort). Be careful, use the object syntax, not the string syntax! The default sort object is `{ createdAt: -1 }`.
query.skip | Number | The number of records to skip in the result. (See [Mongoose skip](https://mongoosejs.com/docs/api.html#aggregate_Aggregate-skip).) If you pass a string value as query.skip, then it will be parsed as an integer.
query.limit | Number | The maximum number of items in the result. (See [Mongoose limit](https://mongoosejs.com/docs/api.html#aggregate_Aggregate-limit).) If you pass a string value ask query.limit, then it will be parsed as an integer.

**Returns:**
```javascript
{
  status: 200, // If everything goes well, we can set a HTTP 200 status code.
  result: {
    items: [], // The items resulted by the query object (filter, select, sort, skip, & limit)
    count: 0 // The number of items that satisfy query.filter
  }
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.

**Example:**
```javascript
import { list } from 'mongoose-crudl'

import ExampleModel from './your/mongoose/model.js'

...

try {
  const response = await list(ExampleModel, params, query)
  
  console.log(response.status) // the HTTP status code of the operation: 200
  console.log(response.result.count) // the number of item satisfies query.filter
  console.log(response.result.items) // an array of objects based on your model
} catch (e) {
  console.error(e) // error thrown by the mongodb or the mongoose package, most likely a connection error
}

```

### createOne(Model, params, body)

Creates an entry in your db.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).
body | Object | The data which will be inserted to the db.

Note: the `params` object will be merged into the body before inserting.

**Returns:**
```javascript
{
  status: 201, // If everything goes well, we can set a HTTP 201 status code.
  result: { ... } // the new entry inserted into the db.
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.
- [Mongoose validation error](https://mongoosejs.com/docs/validation.html#validation-errors)

**Example:**

```javascript
import { createOne } from 'mongoose-crudl'

import ExampleModel from './your/mongoose/model.js'

...

try {
  const response = await createOne(ExampleModel, params, body)
  
  console.log(response.status) // the HTTP status code of the operation: 201
  console.log(response.result) // the newly created MongoDB entry
} catch (e) {
  console.log(e)
}
```




### readOne(Model, params, query)

Reads an entry from your db.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).
query | Object | A query object that only has a select prop.
query.select | Object | A [Mongoose select object](https://mongoosejs.com/docs/api.html#query_Query-select). Be careful, use the object syntax, not the array / string syntax!

Side note: The `params` object should contain an `id` field, which will be mapped to the default `_id` field of MongoDB.

**Returns:**
```javascript
{
  status: 200,
  result: { ... } // the entry you were looking for
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.
- [NotFoundError](https://github.com/gyulanemeth/mongoose-crudl/blob/master/src/errors/NotFoundError.js) whenever the item described by the params is not found.

**Example:**

```javascript
import { readOne } from 'mongoose-crudl'

import ExampleModel from './your/mongoose/model.js'

...

try {
  const response = await readOne(ExampleModel, params, query)
  
  console.log(response.status) // the HTTP status code of the operation: 200
  console.log(response.result) // the entry you were looking for
} catch (e) {
  console.log(e)
}
```



### updateOne(Model, params, body)

Updates an entry in your db.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).
body | Object | The data which will be inserted to the db.

Side note: The `params` object should contain an `id` field, which will be mapped to the default `_id` field of MongoDB.

Side note: the `params` object will be merged into the body before updating.


**Returns:**
```javascript
{
  status: 200,
  result: { ... } // the updated entry
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.
- [NotFoundError](https://github.com/gyulanemeth/mongoose-crudl/blob/master/src/errors/NotFoundError.js) whenever the item described by the params is not found.
- [Mongoose validation error](https://mongoosejs.com/docs/validation.html#validation-errors)

**Example:**

```javascript
import { updateOne } from 'mongoose-crudl'

import ExampleModel from './your/mongoose/model.js'

...

try {
  const response = await updateOne(ExampleModel, params, body)
  
  console.log(response.status) // the HTTP status code of the operation: 200
  console.log(response.result) // the updated entry
} catch (e) {
  console.log(e)
}
```



### deleteOne(Model, params)

Removes an entry from your db.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).

Side note: The `params` object should contain an `id` field, which will be mapped to the default `_id` field of MongoDB.

**Returns:**
```javascript
{
  status: 200,
  result: { ... } // the removed entry
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.
- [NotFoundError](https://github.com/gyulanemeth/mongoose-crudl/blob/master/src/errors/NotFoundError.js) whenever the item described by the params is not found.

**Example:**

```javascript
import { deleteOne } from 'mongoose-crudl'

import ExampleModel from './your/mongoose/model.js'

...

try {
  const response = await deleteOne(ExampleModel, params, query)
  
  console.log(response.status) // the HTTP status code of the operation: 200
  console.log(response.result) // the entry you removed
} catch (e) {
  console.log(e)
}
```



### deleteMany(Model, params)

Often times, you will need to remove all of the related elements of an entry. This function is a utility function for exactly that.

**Parameters:**
Name | Type | Description
--- | --- | ---
Model | Mongoose model | A Mongoose model.
params | Object | A [params object](#params).

Side note: In this case, the `params` object should not contain an `id` field.

**Returns:**
```javascript
{
  status: 200,
  result: {} // a summary about how many elements are actually deleted.
}
```

**Throws:**

- Connection-related [Mongoose](https://mongoosejs.com/docs/api/error.html) or [MongoDB](https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/errors.md) errors.

**Example:**

```javascript
import { deleteOne, deleteMany } from 'mongoose-crudl'

import ExampleModel1 from './your/mongoose/model.js'
import ExampleModel2 from './your/mongoose/model.js'

// Let's assume, that ExampleModel2 has a field called 'ref', referring to an ExampleModel1 entry

...

try {
  const response = await deleteOne(ExampleModel1, params, query)
  
  console.log(response.status) // the HTTP status code of the operation: 200
  console.log(response.result) // the entry you removed

  deleteMany(ExampleModel, { ref: response.result.ref }) // you probably don't want to await for the results, since the main entry is already removed.
} catch (e) {
  console.log(e)
}
```
