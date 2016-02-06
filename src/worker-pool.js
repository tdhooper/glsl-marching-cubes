
var WorkerPool = function(filename, n) {
    this.workers = [];
    this.queue = [];
    var worker;
    while (n--) {
        worker = new Worker(filename)
        this.workers.push(worker);
    }
};

WorkerPool.prototype.each = function(configs, update, done) {
    this.update = update;
    this.done = done;
    this.doneCount = configs.length;

    var worker;
    configs.forEach(function(config, i) {
        worker = this.workers[i];
        if (worker) {
            this.post(worker, config, i);
        } else {
            this.queue.push([config, i]);
        }
    }, this);
};

WorkerPool.prototype.finished = function(worker, configIndex, evt) {
    this.update(evt.data, configIndex);
    this.doneCount -= 1;
    if (this.doneCount == 0) {
        this.done();
    }
    var config = this.queue.pop();
    if (config) {
        this.post(worker, config[0], config[1]);
    }
};

WorkerPool.prototype.post = function(worker, config, configIndex) {
    worker.onmessage = this.finished.bind(this, worker, configIndex);
    if (config.hasOwnProperty('json')) {
        worker.postMessage(config.json);
    }
    if (config.hasOwnProperty('transferable')) {
        worker.postMessage(config.transferable, [config.transferable]);
    }
}

module.exports = WorkerPool;
