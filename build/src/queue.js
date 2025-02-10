import { EventEmitter } from 'node:events';
export class Queue extends EventEmitter {
    q = [];
    activeFunctions = 0;
    concurrency;
    constructor(options) {
        super();
        this.concurrency = options.concurrency;
        // It was noticed in test that setTimeout() could sometimes trigger an event
        // moments before it was scheduled. This leads to a delta between timeToRun
        // and Date.now(), and a link may never crawl. This setInterval() ensures
        // these items are eventually processed.
        setInterval(() => {
            if (this.activeFunctions === 0)
                this.tick();
        }, 2500).unref();
    }
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    on(event, listener) {
        return super.on(event, listener);
    }
    add(function_, options) {
        const delay = options?.delay || 0;
        const timeToRun = Date.now() + delay;
        this.q.push({
            fn: function_,
            timeToRun,
        });
        setTimeout(() => {
            this.tick();
        }, delay);
    }
    async onIdle() {
        return new Promise((resolve) => {
            this.on('done', () => {
                resolve();
            });
        });
    }
    tick() {
        // Check if we're complete
        if (this.activeFunctions === 0 && this.q.length === 0) {
            this.emit('done');
            return;
        }
        for (let i = 0; i < this.q.length; i++) {
            // Check if we have too many concurrent functions executing
            if (this.activeFunctions >= this.concurrency) {
                return;
            }
            // Grab the element at the front of the array
            const item = this.q.shift();
            if (item === undefined) {
                throw new Error('unexpected undefined item in queue');
            }
            // Make sure this element is ready to execute - if not, to the back of the stack
            if (item.timeToRun <= Date.now()) {
                // This function is ready to go!
                this.activeFunctions++;
                item.fn().finally(() => {
                    this.activeFunctions--;
                    this.tick();
                });
            }
            else {
                this.q.push(item);
            }
        }
    }
}
