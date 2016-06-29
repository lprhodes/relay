# About this fork

Currently in upstream Relay, the assumption is made that the `id` field is globally unique as specified in the [Global Object Identification specification](https://facebook.github.io/relay/graphql/objectidentification.htm).
However, in our case this conflicted with an already existing `id` field in our schema that was being consumed by non-Relay clients, changing this would have broken those clients.

After deliberation, the conclusion was that the simplest solution would be to make it easy for people to fork Relay and change the hardcoded instances of `id` to whatever suits their needs.
It also became apperant that there is a chance that the GraphQL specification itself will gain a reserved ID field that may be used by tools such as Relay to for whatever identification purpose.

As of yet, the name for that future ID field most likely is going to be `__id`, which is what this fork uses. This fork will be maintained, as in, kept up-to-date with upstream releases.

You can install [the packages](https://github.com/alloy/relay/releases) as per the `npm install <tarball url>` [documentation](https://docs.npmjs.com/cli/install).

See:

* https://github.com/facebook/relay/issues/1061
* https://github.com/facebook/relay/pull/1232
* https://github.com/facebook/graphql/issues/188

## Update process

* If not previously done, add the upstream remote: `$ git remote add upstream https://github.com/facebook/relay.git`
* Fetch upstream changes: `$ git fetch upstream && git merge upstream/master`
* Check that the upstream changes do not re-introduce a hardcoded use of `'id'`. If it does, submit a PR upstream to fix that.
* Push changes to our remote: `$ git push origin __id`
* Create release with packages: `$ node release.js [GITHUB-TOKEN]`
* Afterwards, your git checkout will be dirty, there’s no need to keep those changes: `$ git checkout .`

----

# [Relay](https://facebook.github.io/relay/) [![Build Status](https://travis-ci.org/facebook/relay.svg?branch=master)](https://travis-ci.org/facebook/relay) [![npm version](https://badge.fury.io/js/react-relay.svg)](http://badge.fury.io/js/react-relay)

Relay is a JavaScript framework for building data-driven React applications.

* **Declarative:** Never again communicate with your data store using an imperative API. Simply declare your data requirements using GraphQL and let Relay figure out how and when to fetch your data.
* **Colocation:** Queries live next to the views that rely on them, so you can easily reason about your app. Relay aggregates queries into efficient network requests to fetch only what you need.
* **Mutations:** Relay lets you mutate data on the client and server using GraphQL mutations, and offers automatic data consistency, optimistic updates, and error handling.

[Learn how to use Relay in your own project.](https://facebook.github.io/relay/docs/getting-started.html)

## Example

The [relay-examples](https://github.com/relayjs/relay-examples) repository contains an implementation of [TodoMVC](http://todomvc.com/). To try it out:

```
git clone https://github.com/relayjs/relay-examples.git
cd relay-examples/todo && npm install
npm start
```

Then, just point your browser at `http://localhost:3000`.

## Contribute

We actively welcome pull requests, learn how to [contribute](./CONTRIBUTING.md).

## Users

We have a [community-maintained list](./USERS.md) of people and projects using Relay in production.

## License

Relay is [BSD licensed](./LICENSE). We also provide an additional [patent grant](./PATENTS).
