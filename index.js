#!/usr/local/bin/node
/**
 * http://www.liuyiqi.cn/2017/12/05/common-puppeteer-api-collection/
 * https://pptr.dev/
 * @type {Puppeteer}
 */

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPad = devices['iPad'];
const fs = require('fs');
const program = require('commander');


let i = 0;

async function page_content_save(page, path) {
    const html = await page.content(path);
    fs.writeFile(path + (i++) + '.html', html, () => {
        console.log('saved :' + page.url())
    });
}

async function page_process(page, events, log) {
    /**
     * listen to the events
     * [load/request/response/...]
     *
     */
    page.on('close', async (data) => {
        if (events['close'] instanceof Function) {
            events['close'](data)
        }
        log("close event:" + data)

    });
    page.on('console', async (data) => {
        if (events['console'] instanceof Function) {
            events['console'](data)
        }
        log("console event:" + data)

    });
    page.on('dialog', async (data) => {
        if (events['dialog'] instanceof Function) {
            events['dialog'](data)
        }
        log("dialog event:" + data)

    });
    page.on('domcontentloaded', async (data) => {
        if (events['domcontentloaded'] instanceof Function) {
            events['domcontentloaded'](data)
        }
        log("domcontentloaded event:" + data)

    });
    page.on('error', async (data) => {
        if (events['error'] instanceof Function) {
            events['error'](data)
        }
        log("error event:" + data)
    });
    page.on('frameattached', async (data) => {
        if (events['frameattached'] instanceof Function) {
            events['frameattached'](data)
        }
        log("frameattached event:" + data)
    });
    page.on('framedetached', async (data) => {
        if (events['framedetached'] instanceof Function) {
            events['framedetached'](data)
        }
        log("framedetached event:" + data)
    });
    page.on('framenavigated', async (data) => {
        if (events['framenavigated'] instanceof Function) {
            events['framenavigated'](data)
        }
        log("framenavigated event:" + data)
    });
    page.on('load', async (data) => {
        if (events['load'] instanceof Function) {
            events['load'](data)
        }
        log("load event:" + data)
    });
    page.on('metrics', async (data) => {
        if (events['metrics'] instanceof Function) {
            events['metrics'](data)
        }
        log("metrics event:" + data)
    });
    page.on('pageerror', async (data) => {
        if (events['pageerror'] instanceof Function) {
            events['pageerror'](data)
        }
        log("pageerror event:" + data)
    });
    page.on('request', async (data) => {
        if (events['request'] instanceof Function) {
            events['request'](data)
        }
        log("request event:" + data)
    });
    page.on('requestfailed', async (data) => {
        if (events['requestfailed'] instanceof Function) {
            events['requestfailed'](data)
        }
        log("requestfailed event:" + data)
    });
    page.on('requestfinished', async (data) => {
        if (events['requestfinished'] instanceof Function) {
            events['requestfinished'](data)
        }
        log("requestfinished event:" + data)
    });
    page.on('response', async (data) => {
        if (events['response'] instanceof Function) {
            events['response'](data)
        }
        log("response event:" + data._url)
    });
    page.on('workercreated', async (data) => {
        if (events['workercreated'] instanceof Function) {
            events['workercreated'](data)
        }
        log("workercreated event:" + data)
    });
    page.on('workerdestroyed', async (data) => {
        if (events['workerdestroyed'] instanceof Function) {
            events['workerdestroyed'](data)
        }
        log("workerdestroyed event:" + data)
    });


}


function list(val) {
    return val.split(',').map(String);
}

function filter(val) {
    return val.split(',').map(String);
}

program
    .version('0.0.1')
    .option('-f, --filter [items]', 'url filters , specify the no needed urls', filter, ['cc'])
    .option('-v, --logs [logs]', 'print all logs', false)
    .option('-p, --path [path]', 'the path to save the html files', "/tmp/")
    .option('-l, --list [items]', 'Specify list urls items defaulting to http://99114.com,http://baidu.com', list, ["http://www.99114.com", "http://www.baidu.com"])
program.on('--help', function () {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ wpull -h');
    console.log('  $ wpull -l http://www.99114.com,http://shop.99114.com');
}).parse(process.argv);


let config = {
    logs: program.logs,
    filter: program.filter,
    list: program.list,
    path: program.path
}

console.log(JSON.stringify(config))


puppeteer.launch({
    //headless: false,
    // slowMo: 250, // slow down by 250ms
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
}).then(async browser => {

    let log = (params) => {
        if (config.logs) {
            console.log(params)
        }
    };

    let target_fn = async target => {
        let p = await target.page();
        page_process(p, {
            request: async request => {
                let doAbord = false
                config.filter.forEach(async function (end_url, index, array) {
                    if (request.url().endsWith(end_url)) {
                        doAbord = true;
                    }
                });
                try {
                    if (doAbord) {
                        await request.abort();
                    } else {
                        await request.continue();
                    }
                } catch (e) {
                    //console.log(e);   // caught
                }
            }
        }, log)
    };

    browser.on('disconnected', async target => {
        log("disconnected:" + target)
    });
    browser.on('targetchanged', async target => {
        target_fn(target)
        log("targetchanged:" + target.url())
    });
    browser.on('targetcreated', async target => {
        log("targetcreated:" + target.url())
    });
    browser.on('targetdestroyed', async target => {
        log("targetdestroyed:" + target.url())
    });
    browser.on('targetcreated', async target => {
        target_fn(target)
        log("targetcreated:" + target.url())
    });

    for (let i = 0; i < config.list.length; i++) {
        let page = await browser.newPage();
        await page.setRequestInterception(true);
        await page.emulate(iPad);
        await page.setExtraHTTPHeaders({Referer: 'https://www.domain.com/langdingpage'})
        await page.goto(config.list[i])
        await page.content();
        await page_content_save(page, config.path)
    }

    await browser.close();

});
