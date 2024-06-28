使用 cloudflare pages 来加速访问 dockerhub 镜像。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/whyun-docker/docker-registry)

请将本项目仓库 fork 到自己的 github 仓库，然后在 cloudflare pages 中新建项目来使用。
1. 使用 cloudflare 账号登录其 dashboard 后台，选择 **Workers 和 Pages** 菜单，然后点击 **概述**，接着点击 **创建** 按钮，在打开的页面中选择 Pages 选项卡：
![](docs/init_with_git.png)

**图1**

选择 git 模式进行部署。

2. 选择你 clone 好的项目，点击 **开始设置** 按钮：

![](docs/select_project.png)

**图2**

3. 除了项目名字之外，所有配置项都使用默认值即可，点击 **保存并部署** 按钮：

![](docs/save_config.png)

**图3**

4. 经过短暂时间的等待，如果你看到如下界面，恭喜你部署成功：

![](docs/deploy_finished.png)

**图4**

5. 点击 **继续处理项目按钮**，在展示的页面中点击 **访问站点** 链接，即可验证站点的部署情况，不过默认需要等几分钟才能打开网站。

![](docs/show_url.png)

**图5**

6. 网站可访问后展示效果：

![](docs/site_content.png)

**图6**

更多详细使用教程参见 [cloudflare page 教程（一）项目初始化](https://blog.whyun.com/posts/project-init-on-cloudflare-pages/) 。