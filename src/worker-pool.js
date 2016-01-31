
var WorkerPool = function(filename, n) {
    this.workers = [];
    this.queue = [];
    var worker;
    while (n--) {
        worker = new Worker(filename)
        worker.onmessage = this.finished.bind(this, worker);
        this.workers.push(worker);
    }
};

WorkerPool.prototype.each = function(configs, update) {
    var len = configs.length;
    this.update = update;
    var worker;
    configs.forEach(function(config, i) {
        worker = this.workers[i];
        if (worker) {
            worker.postMessage(config);
        } else {
            this.queue.push(config);
        }
    }, this);
};

WorkerPool.prototype.finished = function(worker, evt) {
    this.update(evt.data);
    var config = this.queue.pop();
    if (config) {
        worker.postMessage(config);
    }
};

module.exports = WorkerPool;
