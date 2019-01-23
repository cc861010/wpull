# wpull
pull a single page like wget

# ./wpull -h
```
Usage: index [options]

Options:
  -V, --version         output the version number
  -f, --filter [items]  url filters , specify the no needed urls (default: ["cc"])
  -v, --logs [logs]     print all logs (default: false)
  -p, --path [path]     the path to save the html files (default: "/tmp/")  -l, --list [items]    Specify list urls items defaulting to http://99114.com,http://baidu.com (default: ["http://www.99114.com","http://www.baidu.com"])
  -h, --help            output usage information

Examples:

  $ wpull -h
  $ wpull -l http://www.99114.com,http://shop.99114.com
```

