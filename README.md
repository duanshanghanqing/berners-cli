# 开发
    安装 lerna，已安装忽略，https://github.com/lerna/lerna
    
        npm install lerna -g
    
    克隆项目

        git clone https://github.com/duanshanghanqing/berners-cli.git
    
    初始化项目，安装依赖

        lerna bootstrap
    
    link相关软件包

        cd core/cli
        npm link

# 调用关系

    @berners-cli/core -> @berners-cli/exec -> require(rootFile).apply(null, arguments); -> 执行指定目录文件
