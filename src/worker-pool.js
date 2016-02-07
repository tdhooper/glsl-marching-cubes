
var WorkerPool = function(filename, n) {
    this.queue = [];
    this.workers = [];
    while (n--) {
        this.workers.push(
            Promise.resolve(new Worker(filename))
        );
    }
    this.eachPromise = Promise.resolve();
}

WorkerPool.prototype.abort = function() {
    this.queue = [];
    this.aborting = true;
    var that = this;
    this.eachPromise.then(function() {
        that.aborting = false;
        return Promise.resolve();
    });
}

WorkerPool.prototype.each = function(action, configs, update, done) {
    var that = this;
    update = update || function() {};
    done = done || function() {};
    this.eachPromise = this.eachPromise.then(function() {
        if (that.aborting) {
            return Promise.resolve();
        }
        that.queue = configs.map(function(config, index) {
            return {
                action: action,
                config: config,
                index: index
            };
        });
        return Promise.all(that.workers.map(function(workerPromise) {
            return workerPromise.then(this.nextJob.bind(this, update));
        }, that)).then(function() {
            if ( ! that.aborting) {
                done();
            }
        });
    });
};

WorkerPool.prototype.nextJob = function(update, worker) {
    var job = this.queue.shift();
    if (job) {
        return this.process(worker, job, update).then(this.nextJob.bind(this, update));
    } else {
        return Promise.resolve();
    }
};

WorkerPool.prototype.process = function(worker, job, done) {
    var that = this;
    var config = job.config;

    return new Promise(function(resolve) {

        worker.onmessage = function(evt) {
            if ( ! that.aborting) {
                done(evt.data, job.index);
            };
            resolve(worker);
        }

        if (config.hasOwnProperty('json')) {
            worker.postMessage({
                action: job.action,
                data: config.json
            });
        }

        if (config.hasOwnProperty('transferable')) {
            worker.postMessage({
                action: job.action,
                data: config.transferable
            }, [config.transferable]);
        }
    });
};

module.exports = WorkerPool;
