---
title: 操作系统安全课程复习笔记
key: c8f7da56293fe020d62c8c5ad32cfcab
tags:
  - Course
date: 2020-06-05 9:46:45
---

课程体系：

![](/assets/images/move/2020-06-04-21-19-07.png)

## 0x01 相关概念

### 信息安全评估标准

**TCSEC**（Trusted Computer System Evaluation Criteria，可信计算机系统评价标准）

- A 级：校验级保护，提供低级别手段
- B3 级：安全域，数据隐藏与分层、屏蔽
- B2 级：结构化内容保护，支持硬件保护
- B1 级：**标记安全保护**，如 system V
- **C2 级：有自主的访问安全性，区分用户**
- C1 级：不区分用户，基本的访问控制
- D 级：没有安全性可言，例如 MS DOS

Windows 属于 `C2` 级，安全策略如下：

- **强制的用户标识和认证**：所有的用户都必须以唯一的登陆标识和密码来鉴别自身。
- **自主访问控制**：文件的属主可以制定对对象的保护策略。
- **可记账性和审核性**：能够审计所有安全相关事件和个人活动。
- **对象的重用**：能够保护对象在完成其使命后，不再被其他对象所利用。


### Windows 安全体系结构、组件

![](/assets/images/move/2020-06-04-21-40-48.png)

Windows NT 体系结构分为内核模式和用户模式。

#### 内核模式（Kernel Mode）

内核模式中的代码具有极高的权限，可以直接对硬件进行操作和直接访问所有的内存空间（ring0 级）。

- 组成内核模式的整套服务被称为执行服务。
    - 对象管理器（`OM`: Object Manager）
    - 安全引用监控器（`SRM`: Security Reference Monitor）


#### 用户模式（User Mode）

用户模式中的代码具有较低的权限，不能直接访问硬件，内存访问受限（ring3 级）。

- 本地安全子系统：支持 Windows 的身份验证、审核。
    - 核心为本地安全授权 `LSA`（Local Security Authentication）
    - 需和 Win32 子系统通信

#### OM SRM LSA

`OM`：对象管理器负责对象的命名、保护、分配和处理。

`SRM`：安全引用监控器与对象管理器 `OM` 联合起来，实施**访问控制策略和审核策略**。在对象句柄创建时进行安全检查，而不是在每次访问都进行。

`LSA`：负责使所有本地和远程的用户登陆生效，生成访问令牌（访问令牌是一个二进制的数据包，它描述了用户的访问权限以及用户所属地组）。管理本地安全策略，负责记录安全引用监视器 `SRM` 的任何审核消息所产生的事件日志。

### Windows 的用户和组

- 用户账户
    - 使用用户名和密码进行标识
    - `SID`（Security Indentifies，SID 安全标识符）：账户的关键标识符，所有的内部进程都是用 SID 识别用户账号。

- 用户组账户
    - 具有相似工作或资源要求的用户可组成一个用户组。
    - 对资源的存取权限许可分配给一用户组，就是同时分配给该组中的所有成员。

### 域及信任关系

**工作组**：为小型办公系统提供了共享资源的功能，使用户可共享其他计算机的本地资源；但是不共享任何用户账户和组账户的信息，每个系统使用自身的安全账号管理器 `SAM`（Security Account Manager）数据库独立验证。

**域**：域是一批具有集中安全授权机构和若干台工作站和成员服务器得计算机集合；一个域中的所有用户共享域用户账户数据库和普通的安全策略，不需要提供自己的认证服务。

域和工作组对比：

- 域可定义安全管理边界，工作组无集中管理，相互独立。

    域中所有用户共享普通的用户账户数据库和安全策略，工作组中计算机使用本地账户和本地策略。

- 验证

    - 安全账户数据库
        工作组中计算机上的用户账户在登录本机时使用的是系统自身的 SAM 数据库独立验证。当登录到域时用的是域上的用户账户数据库。

    - 验证服务

        域验证时，每台计算机不需要提供自己的验证服务，工作组中登录验证用的是本机的验证服务。

- 登陆成功访问范围

    域在整个受信任域中访问许可的资源，工作组为本机资源。

**信任关系**：一个域可以信任另一个域的账户访问自己的资源，又不必须要本域的用户账户和口令。（A -> B: A 信任 B，B 中的用户允许访问 A 中的资源）

- 好处
    - 实现跨域的集中安全验证
    - 支持用户的单一登录

- 种类
    - 单向信任
    - 双向信任
    - Windows NT 的信任关系是单向且不具有传递性，Win2000 之后默认信任关系是双向且可传递。


## 0x02 活动目录

活动目录提供了完全集成的在 Windows 中的一个安全、分布式、可扩展以及重复的分层目录服务。

WinServer AD 域服务的核心价值是提供一套完整的用户身份验证系统，这是一个基础身份验证平台，用户实现单点登录。在此基础上再实现对共享资源和服务的管理及访问。

活动目录中所支持的一些最重要的 Internet 标准：

- `LDAP`：对活动目录的访问通过 LDAP 进行
- `X.500`：活动目录信息模型源自 X.500 模型
- `Kerberos`：活动目录的认证协议
- `DNS`：作为内在的地址定位服务

### 活动目录功能的机制

- **单点登录**（Kerberos）

![](/assets/images/move/2020-06-04-22-22-15.png)

- **全局目录（GC，Global Catalog）**
    全局目录是一个域树或者域森林中的所有对象信息的中心仓库。它记录 AD 中所有域对象的部分信息、架构信息和配置信息的完整副本。
    执行**登陆和查询**任务，用户登陆时向域控制器提供通用组成员信息，在查询目录信息时，首先会送到最近的 GC，当查询对象不在 GC 时才会转至对象所在域。

- **多主复制**：通过安装域控制器，可在整个网络环境中创建目录的多份副本；网络任何地方发生变化都会在整个网络中自动复制，保证数据一致性。

- **组策略**：在不同层次上定义控制规则。


### 活动目录保存的信息

- **域数据**：包含域内的所有对象信息，域内的每个域控都复制了这个信息（不超过该域的范围）。
- **架构数据**：定义了可在 AD 中存储哪些对象、属性和操作规则，在森林中的每个域控都存储。
- **配置数据**：定义了复制拓扑和 AD 配置有关的其他数据，复制到森林中的所有域控。
- **如果是 GC 服务器**，还为所有域保存 “域数据” 的部分副本（包含那些在操作中最常用的属性）。

### 活动目录对象

- 容器对象
    可存储其他对象，如域，组织单元，文件夹等。

- 叶对象
    不能存储其他对象，如计算机，用户，文件等。

AD 中常见对象：

![](/assets/images/move/2020-06-04-22-34-09.png)

对象的标准属性：

- `DN`(Distinguished Name，**识别名称**)定义了 LDAP 中到对象的完整路径。

    完整路径包括对象名称以及直到域根节点的所有父对象名称，DN 标识了域层次中的唯一对象。

- `RDN`(Relative Distinguished Name相对识别名称)是 DN 中属于对象完整路径属性的一部分。

- 全局唯一标识符(`GUID`)

    GUID 是对象创建时由活动目录分配的 128 位数字。每一位对象都具有唯一标示。GUID 不能被修改和删除。

- 主体属性：安全主体名称

    - 安全主体分三类：用户，组，计算机。
    - 在单个域内用来唯一标识用户，计算机或组的名称。
    - 域内必须唯一，域间无需唯一。

- 安全标识符(`SID`)

    SID 是 Windows 系统安全子系统为安全主体对象创建的唯一数字，属于主体属性。
    Win 系统内部进程引用的是账户的 SID，而不是账户的用户或者组名。

注意：

- 标准属性：DN/RDN、GUID、安全主体名称、安全标识符（SID）

- 不同环境下对象的名称
    - 在单个域内，SID/GUID/DN 都可以唯一标识到域中的每个安全主体
    - 对象被重新命名，或移动到另一个域时，DN、RDN 和 SID 会换，GUID 不变


### 活动目录组件

**能够为企业网建立相应的逻辑结构**

- 逻辑结构
    - **组织单位**（Organizational Unit，`OU`）
        主要用来委派对用户、组及资源集合的管理权限。组织单位是委派管理权限的最小分组，其特殊在于可连接组策略。功能如下：
        - 分类组织对象
        - 委派管理控制权
        - 配置组策略
    - **域（Domain）**
        同一个域中的计算机共享配置，架构和全局目录，域是网络中复制和安全管理的**基本单元**。
    - **域树（Tree）**
        具有**连续命名空间**的多个域成为树。目录树中所有域共享相同的配置，架构和全局目录。
    - **域森林（Forest）**
        不构成连续命名空间的域树的集合，目录树通过双向可传递的信任关系链接在一起。
        AD 中建立的第一个域成为林的根域。
- 物理结构
    - **站点（Site）**
        由高速连接所形成的较快通信速率网络（一般指局域网 LAN），用于确定复制拓扑，以便进行有效而快速的复制。站点是独立于域的，是对网络上计算机的实际物理分布的客观反映。
        - 站点映射网络的物理结构，域映射组织的逻辑结构。
        - 网络的物理结构和域结构之间没有必然联系。
        - 活动目录允许在一个站点出现多个域，与允许一个域出现在多个站点中。

## 0x03 组策略、配置

组策略是管理员针对网络中的**用户和计算机**所作的一系列设置，以控制程序、网络资源和操作系统行为。

计算机和用户是仅有的接受组策略的活动目录对象类型。组策略使管理员可以集中控制用户环境，减轻管理负担。

**组策略对象**（`GPO`，Group Policy Object）存储了组策略的具体配置，每一个 GPO 都链接到一个具体的活动目录容器，包括站点、域、组织单元。

组策略与活动目录的结合：
- 联合使用，则可实现策略的集中与分散管理，适应从小到大的各种规模。
- 组策略管理单元提供了管理组策略的集成工具，并提供了 MMC 管理工具的扩展。

### 组策略的设置对象

- 针对站点、域、OU 设置组策略。
- 不在域内的可以利用本地组策略管理计算机。

OU/域/站点分别有不同的目的，大概记一下表格：

![](/assets/images/move/2020-06-04-23-03-13.png)

### 组策略的应用顺序

- 组策略具备**继承**规则

- 组策略有**累加性和相应优先级**
    **OU > Domain > Site > 本地**（即应用顺序是先应用本地，再应用站点，再应用域，再应用OU，最后应用的优先级最高）
![](/assets/images/move/2020-06-04-23-12-55.png)

- 操作系统**先处理计算机配置，然后处理用户配置**
    在环回设置中，如果设定为 “替代”，则计算机的策略设置完全替代用户的，用户的不生效；如果为 “合并”，则计算机的叠加在用户的后面，发生冲突时计算机的生效。

组策略的**冲突解决机制**：

- **先处理计算机配置，后处理用户配置**
    在环回设置中，如果设定为“替代”，则计算机的策略设置完全替代用户的，用户的不生效；如果为“合并”，则计算机的叠加在用户的后面，发生冲突时计算机的生效。
- **OU > Domain > Site > 本地**（即应用顺序是先应用本地，再应用站点，再应用域，再应用 OU，最后应用的优先级最高）
- **禁止替代**发生冲突时，采用层次较高的那个。
- **禁止继承**：将某个容器配成禁止继承后，将不会从这个容器的各种父容器中继承下来组策略，但是无法阻止那些禁止替代的组策略继承到自己上面。

总结：

- 组策略能够从站点，域和最后的组织单元继承而来
- 应用组策略对象的顺序和级别决定了用户和计算机实际能收到的组策略设置
- 组策略能够在站点、域、组织单元上被阻塞
- 组策略本身还能够以非覆盖的方式来强制实施
- 组策略可以有条件的实施和执行

### 组策略的实现

- 企业框架的组织

- 根据相应组织框架设计管理策略

- 与安全相关的配置
    - 账户策略（密码策略、账户锁定策略）
    - 限制软件策略
    - IPSec 策略、公钥策略、访问控制策略
    - 远程安装服务、审计策略、磁盘阵列

- 管理相关的设置

- 可对不同层次安全单元进行策略设置

## 0x04 公钥基础结构 PKI

`PKI`（Public Key Infrastructure） 是一组组件和规程，用非对称密码算法原理和技术实现的安全基础设施。

### PKI 的组件

组成 PKI 的核心块：

- 证书 Certificates
- 证书吊销列表 Certificate revocation lists(CRL)
- 认证机构 Certificate authorities(CAs)	

PKI 的组件：

- 证书签发机构（CA）：是 PKI 中受信任的第三方实体，向主体颁发证书、续借和更新证书，是信任的起点。
- 证书注册机构（RA）：用于在证书登记过程中核实申请者的身份。
- 证书库：用于存储，分发证书和证书吊销列表。
- 档案库：用来解决未来争端的信息库，为 CA 承担长期存储文档信息的责任，以便未来决定在一份旧的文档中数字签名是可信任的。
- 用户：申请者/验证者。
- 密钥备份及恢复系统：只能针对解密私钥，不能备份签名私钥。
- 证书废除处理系统：将证书放入 CRL 中，然后对吊销列表中证书的数据结构进行数字签名。
- 应用系统接口：建立良好的应用接口，方便各种用户和服务能够和 PKI 交互。

### CA 的功能

证书签发机构 `CA` 是 PKI 中受信任的第三方实体，向主体颁发证书、续借和更新证书，是信任的起点。

工作过程：

- 证书生成：用户生成公钥/私钥对，发出证书请求到 CA 中。CA 在验证申请者身份后，把用户信息和公钥绑定起来，用自己的私钥对它签名，形成证书并返回给用户。

- 证书吊销：CA 将证书放入 CRL 内，并对其数据结构进行数字签名。发布吊销的方法：周期发布机制/在线查询机制（数据包 OCSP）。CA 将 CRL 放入一个公共存储库内，终端收到证书时首要任务就是对 CRL 进行检索。


### 证书的使用及验证

使用：WEB 安全/ EFS /EMAIL 安全/...

验证：

（1）真实性：基于证书链验证机制，验证该证书是否由可信的 CA 机构颁发
（2）有效性：证书是否在有效使用期内
（3）可用性：证书是否遭到废除
（4）验证证书的用途。


## 0x05 文件系统

### NTFS 权限及在文件系统中的实现

NTFS 权限即文件夹与文件的访问权限。

**权限原则**：**权限会继承，以文件夹为权限的设置对象，拒绝权限优于其他权限。**

**实现机制**：在 $Secure 里面包含两个索引表 $SDH 和 $SII（常驻），和一个非常驻的**存储安全描述符内容**的 $SDS。
$SDH 保存安全描述符的 hash 值和对应在 SDS 中的偏移量。
$SII 保存 NTFS 安全 ID（这个安全 ID 也在文件的属性中保存）和 SDS 的偏移量。

工作过程：

1. **SDH 可以快速查找安全描述符是否已在 SDS 中保存。**
    计算安全描述符的 hash 值，并在 SDH 中查找。
    如果找到 hash 值的匹配项，则对应到 SDS 中找到安全描述符。
    如果安全描述符不匹配，则继续查找。
    如果最终找到，则查询其对应的安全 ID，并记录在文件的 $STANDARD_INFORMATION 属性中。
    若不存在，则为其生成安全 ID，内容存储在 SDS 当中，然后把相应的偏移量存储在 SII 和 SDH 中.
    （上述过程可以想象为创建一个新文件，或者变更一个文件的权限时，写入这个文件新的权限的过程）
2. **SII 可以在 Secure 中快速查找安全描述符。**
    打开文件时，从文件属性中找到内部的安全 ID。然后查找 SII 记录，找到对应的 SDS 偏移量；然后转到相应 SDS 偏移处，找到文件安全描述符。


### 加密文件系统（EFS）

#### 加解密过程

加密：
1. 文件被一个随机的 Key(文件加密密钥 FEK) 加密。
2. 用用户公钥加密 FEK，产生文件解密区域 DDF。
3. 用恢复代理的公钥加密 FEK，产生文件恢复区域 DRF。
4. 将加密后的内容，DDF，DRF 写入磁盘。完成。

解密：
1. 使用用户私钥解密 DDF，得到 FEK。
2. 使用 FEK 解密文件。

优势：

- 基于公钥与文件系统紧密结合的加密技术
- 操作上完全透明
- 支持对单个文件或文件夹加解密
- 提供数据恢复

局限性：

- 增加花费，降低性能
- 无法检测到病毒
- 恢复代理影响性能
- EFS 对一切进程，系统中如有泄密者可将文件传出。

#### 密钥管理

DDF 和 DRF（即加密的 FEK）保存在 MFT 的属性当中。用户的私钥保存在用户配置文件目录下，并用用户的主密钥来加密该目录。而用户的主密钥又存放在另一个用户配置文件中，用用户的口令来加密这个配置文件。因此，当用户更改口令时，需要解密用户配置文件的主密钥，并使用新的口令来加密这个主密钥。

解密链条：用户口令 -> 主密钥 -> 私钥 -> FEK -> EFS 加密文件.


### 磁盘配额

**\* 磁盘配额的实现及文件系统相关的实现机制**

**作用**：避免由于磁盘空间使用的失控可能造成的系统崩溃。

- 配额是**以文件所有权为基础的**，不受位置限制。

- **只适用于卷，且不受卷的文件夹结构以物理磁盘影响。**

**实现机制：**

保存在 \$Extend\$Quota 下，包含两个索引项 `$O` 和 `$Q`。

O 索引包含 SID 和用户 ID 的对应关系，而 Q 索引包含用户 ID 和配额项的对应关系。文件属性中存储的是用户 ID。

在创建文件时，从应用程序处获取 SID（SID 是在进程中表示安全主体的），通过查找 O 找到用户 ID，并通过用户 ID 查找 Q 获取配额项，再进行验证。


### 数据备份的策略及 RAID 机制的几种备份机制

**备份策略：**

- **完全备份**：对数据进行完全拷贝。清除存档属性。
    对某一个时间点上所有的数据或应用进行一个完全的拷贝。
- **差异备份**：仅备份增加或修改的数据。**不清除存档属性**。
    在一次**全备份**后到进行差异备份的这段时间内，对那些增加或者修改的文件进行备份。在进行恢复时，只需对上次全备份和最后一次差异备份进行恢复。
- **增量备份**：备份有变化的数据。清除存档属性。
    备份上一次备份（完全备份、差异备份、增加量备份）之后有变化的数据。

**RAID 机制：**

**独立磁盘冗余阵列 RAID** （Redundant Array of Independent Disk）将多块磁盘通过一定的技术手段组成一块虚拟磁盘使用。利用数组的方式制作磁盘组，配合数据分散排列的设计，提升数据存储速度和可靠性。

- RAID0：条带 RAID。数据分割到多块磁盘上存储。速度明显提升，不浪费空间，但是无冗余，无校验。
- RAID1：镜像 RAID。同时将数据写入两块 RAID。读取速度快，存储安全。写入速率低，成本高。
- RAID0+1：四块磁盘实现，两块来 RAID0，再找两块镜像前面的两个 RAID0。读写快速，安全，成本高。
- RAID5：奇偶校验。交叉存取数据和奇偶校验到三块磁盘上，如果一块挂掉，可以用另外两块结合奇偶校验来恢复。数据安全，读取效率高，磁盘利用率高，写入速率低。

### 数据恢复机制（基于备份、非备份）

误删恢复：

删除过程：
1. 找到文件对应的 MFT，将标志位改为 0.
2. 从根路径开始，一级一级找到文件所在的父目录，以确定被删除文件的簇号，并将父目录所包含文件的记录项删除。
3. 在 Bitmap 中把文件所占用簇相应位置清零，以方便将该簇分配给其他文件。

恢复条件：如果之前所占用簇没有分配给其他文件使用，即文件所存储的位置没有被其他文件占用，则可以恢复。


## 0x06 身份验证

### 针对字典、穷举攻击的防范策略

- 启动口令复杂化机制
- 设置账户锁定阈值
- 记录登陆失败事件日志
- 禁用无人使用的账户
- 锁定真正的 Administrator 账户并创建一个诱饵管理员账户

### 交互式本地登录、域登录各组件作用

![](/assets/images/move/2020-06-05-08-26-50.png)

- **Winlogon**: 加载**两个组件**（GINA 和身份验证程序包），维护**三个状态**（Winlogon 桌面——已注销状态；应用程序桌面——已登录状态；屏保桌面——已锁定状态）
    **四个动作**: 注册 SAS（Ctrl+Alt+Del）；加载其余两个组件（GINA 和 身份验证程序包）；生成三个桌面，维护三种状态；向 GINA 发送事件通知消息，提供 GINA 调用的接口函数，**保证其操作对其他进程不可见**。
- **GINA**（图形识别和认证接口，Graphical Identification and Authentication）：提供 Winlogon **用户标识和验证用户的输出函数**。
- **网络提供程序的动态链接库**：提供通过标准协议到其他类型网络的辅助身份验证功能。

具体认证过程：

Winlogon -> GINA -> LSA -> 身份验证程序包 -> LSA -> Winlogon


1. Winlogon 切换到 Winlogon 桌面，并调用 GINA 来显示登录对话框，等待用户输入用户名和口令。

2. 当用户输入信息之后，GINA 将它传送给 LSA 进行验证。LSA 调用适当的验证程序包（MSV1_0），并将口令使用单向散列函数。

3. 若 SAM 找到用户信息，转向身份验证程序返回用户的 SID 和用户所在组的 SID。

4. 身份验证程序包向 LSA 返回这些 SID。

5. LSA 使用这些 SID 创建安全访问令牌，并将令牌句柄和登录确认信息返回给 Winlogon，用户进入 Windows 桌面。


### Kerberos 

**Kerberos 用户身份验证服务和票据授予服务过程及 Kerberos 策略**

Kerberos: 基于可信第三方(Trusted Third Party, TTP)的认证协议；基于**对称加密技术**。

Kerberos 目标是把 Unix 认证、授权、审计的功能拓展到网络环境，实现**集中的身份认证和密钥分配**，用户只需输入一次身份验证信息，就可以访问多个服务。

基本思想（假设）：能正确对信息进行解密的用户即为合法用户。

用户在访问应用服务器之前，必须从第三方 (Kerberos 服务器) 获取该应用服务器的授权票据 (Ticket)。

Kerberos 认证协议包含 3 个子协议，称之为**交换**：

1. 认证服务器交换(AS 交换)

2. 票据许可服务器交换(TGS 交换)

3. 客户/服务器认证应用交换(AP 交换)

**整体流程**：

1. **登录**：客户端`用户 A` 输入用户名、密码

2. **认证**：系统验证客户端`用户 A`身份 

3. **授权**：系统授权客户端`用户 A`访问`服务 S`

4. **请求服务**：客户端`用户 A`往`服务 S`发送请求


**参与的角色**：

- `Client`: Application Client 应用客户端 

- `AS`（身份验证服务，Authentication Server）对用户身份进行验证，并发行用户访问票据授予服务 TGS 的票据 `TGT`：Ticket_tgs（票据授予票据 TGT） 

- `TGS`（票据授予服务，Ticket-Granting Service） 用来授权服务访问，给客户发行使用网络服务的会话票据 `ST`：Ticket_s。

- `SS`: Service Server 用户所请求的服务


![](/assets/images/move/2019-12-10-14-59-52.png)

\* KDC：密钥分发中心。

\* 票据(Tikcet)：一种临时的证书，用 TGS 或应用服务器的密钥加密，分别为 TGS 票据 TGT 和服务票据 ST。


**详细流程**：


1. 用户登录

![](/assets/images/move/2019-12-10-15-17-15.png)

  - 用户登录阶段，通常由用户输入`用户名`和`密码`信息。
  - 在客户端侧，用户输入的`密码`信息被通过一个单向 Hash 函数生成一个`Client密钥`。

2. 请求身份认证

  2.1 客户端向AS发送认证请求

![](/assets/images/move/2019-12-10-15-18-19.png)
  - 客户端为执行登录操作的用户向 **AS** 发送**认证请求**。
  - 请求中带有`用户名`信息，用户名以明文形式发送到客户端。
> Client 往 AS 发送认证请求时并未发送`密码`或`密钥`信息。

  2.2 AS 确认 Client 端登录者用户身份
![](/assets/images/move/2019-12-10-15-23-07.png)
  - AS收到用户认证请求之后，根据请求中的`用户名`信息，从数据库中查找该用户名是否存在。
  - 如果`用户名`存在，则对应的`密码`也可以从数据库中获取到。AS 利用相同的单向 Hash 函数为`密码`生成一个秘钥，如果第1步中用户提供的`密码`信息正确，该秘钥与用户登录章节中的`Client密钥`相同。
  - AS 为 Client 响应如下消息：
    - **Msg A**  使用`Client密钥`加密的`Client/TGS SessionKey`
    - **Msg B** 使用`TGS密钥`加密的`TGT(Ticket-Granting-Ticket)`，因此该消息 Client 不可解析。
      TGT中包含如下信息：
      - Client/TGS SessionKey
      - Client ID
      - Ticket有效时间
      - Client网络地址
  - Client 收到 AS 的响应消息以后，利用自身的 `Client密钥` 可以对 Msg A 进行解密，这样可以获取到`Client/TGS SessionKey`。但由于 Msg B 是使用 `TGS密钥` 加密的，Client 无法对其解密。
  > 1. AS 响应的消息中有一条是属于 Client 的，但另外一条却属于 TGS。
    2. Client/TGS SessionKey 出现了两个 Copy，一个给 Client 端，一个给 TGS 端。
    3. 本文中提及的加密，如无特殊说明，均采用的是**对称加密算法**。

3. 请求服务授权

  3.1 客户端向 TGS 发送请求服务授权请求
![](/assets/images/move/2019-12-10-15-30-15.png)
  客户端发送的请求中包含如下两个消息：
  - **Msg C**
    - 要请求的服务 ID, 即 `Service ID`；
    - 上一步 2.2 中由 AS 为 Client 提供的 `TGT`。
  - **Msg D**
    - 使用 `Client/TGS SessionKey` 加密的 Authenticator 1 {Client ID, Timestamp}。
  
  3.2 TGS 为 Client 响应服务授权票据
![](/assets/images/move/2019-12-10-15-32-28.png)
  TGS 为 Client 响应的消息包括：
  - **Msg E** 使用 **Service密钥** 加密的 Client-To-Server Ticket, 该 Ticket 中包含了如下信息:
    - `Client/Server SessionKey`
    - Client网络地址
    - Ticket有效时间
    - Client ID
  - **Msg F** 使用 `Client/TGS SessionKey` 加密的 `Client/Server SessionKey`。

  Msg F使用了`Client/TGS SessionKey`加密，因此，该消息对 Client 可见。Client 对其解密以后可获取到 `Client/Server SessionKey`。
  而 Msg E 使用了`Service密钥` 加密，该消息可视作是 TGS 给 Service Server 的消息，只不过由 Client 一起携带。

4. 发送服务请求

  4.1 Client 向 SS(Service Server) 发送服务请求
![](/assets/images/move/2019-12-10-15-35-30.png)
  发送的消息中包括：
  - Msg E 上一步 3.2 中，TGS 为 Client 响应的消息 Msg E。该消息可以理解为由 Client 为 SS 携带的消息。
  - Msg G 由 `Client/Server SessionKey` 加密的 `Authenticator 2`，包含 `{Client ID, Timestamp}` 信息。
  这里的 Authenticator 2 区别于前面 3.1 步骤中的 Authenticator 1。
  
  4.2 SS 响应 Client
![](/assets/images/move/2019-12-10-15-37-28.png)
  SS 收到客户端的服务请求之后，先利用自身的 `Service密钥` 对 `Msg E` 进行解密，提取出 `Client-To-Server Ticket`, 在 3.2 步骤中，提到了该 Ticket 中包含了 `Client/Server SessionKey` 以及 `Client ID` 信息。
  SS 使用 `Client/Server SessionKey` 解密 `Msg G`，提取 Client ID 信息，而后将该 Client ID 与 Client-To-Server Ticket 中的 Client ID 进行比对，如果匹配则说明 Client 拥有正确的`Client/Server SessionKey`。
  而后，SS 向 Client 响应 `Msg H`(包含使用`Client/Server SessionKey`加密的 Timestamp 信息)。
  Client 收到 SS 的响应消息 Msg H 之后，再使用`Client/Server SessionKey`对其解密，提取 Timestamp 信息，然后确认该信息与 Client 发送的 Authenticator 2 中的 Timestamp 信息一致。
  如上信息可以看出来，该交互过程起到了`Client`与`SS`之间的**双向认证**作用。

**分成两个 AS 和 TGS 的原因：减少输入认证信息的次数，服务器可能分属不同的网络域，由不同的 TGS 管理，采用同一个 AS 可以保证单点登录。**

## 0x07 访问控制

限制访问主体对访问客体的访问权限，从而使计算机系统在合法范围内使用。

### Windows 访问控制模型及组件

自主访问控制模型：允许客体属主制定对象的保护策略，通常通过访问控制列表实现。

![](/assets/images/move/2020-06-05-14-19-04.png)

用户登陆认证通过后，系统为其创建访问令牌。运行程序时，线程将取得令牌的拷贝。

程序请求访问客体时，提交令牌，SRM 使用该令牌，通过 OM 读取客体的安全描述符，并与令牌中的相应信息做比较来执行访问检查和控制。若通过，则授权程序访问客体；否则则拒绝。

组件：SRM / OM / 令牌

- `OM`：**对象管理器**负责对象的命名、保护、分配和处理。

- `SRM`：**安全引用监控器**与对象管理器 `OM` 联合起来，实施**访问控制策略和审核策略**。在对象句柄创建时进行安全检查，而不是在每次访问都进行。


### 主体和客体的安全描述

- 主体：**访问令牌**
    由安全标识符创建。包含用户 SID /组 SID /特权信息/其他访问信息。
    用户认证通过后，系统为其创建访问令牌，线程获取令牌的拷贝。
    程序请求访问客体时，提交令牌，SRM 使用令牌与客体的安全描述进行比较来执行访问检查和控制。
    - 令牌模拟：
        正常情况下，服务进程在自己的安全上下文中运行，使用主令牌；当用户请求时，服务进程创建执行线程来相应请求，使用客户安全环境相关联的临时模拟令牌。
        模拟级别：
        - 匿名：可以模拟用户，但不包含用户的任何信息
        - 标识：允许服务获得客户的身份信息供自己使用，但不允许服务模拟该用户
        - 模拟：无论客户和服务器是否在一台计算机上，允许服务器在访问服务器上资源时，可模拟客户来访问，但不能在远程系统上模拟客户。
        - 委派：允许服务在访问服务器资源和其他计算机资源时，都可模拟用户。


- 客体：**安全描述符**

    每一个安全性对象都有一个安全性描述符。

    - 对象所有者的 SID
    - 基本所有组的 SID
    - 自定义的访问控制列表 DACL
        - DACL 来源：（1）直接分配（2）继承自父对象（3）由 OM 默认分配
        - 空 DACL /无 DACL：前者是谁都不能访问，后者是谁都可以访问

    - 系统访问控制列表 SACL

### 客体中策略的冲突解决办法

- 拒绝 > 允许
- 直接 > 继承
    1. 直接把访问及控制信息分配给对象。
    2. 从父对象中检查可继承的访问控制信息。
    3. OM 所提供的默认访问控制信息，并分配给对象。
- 继承中，级数越接近自己优先级越高。(下级的优先权更高)


### 分布式访问控制实现

**用户和域组（全局组、域本地组、通用组）**

**域本地组**：用于**分配权限**，用通用组或全局组加入。域本地组的成员可以来自所有域的用户和组，但其作用域只能是当前域。-> **来自于全林，作用于本域。**
**通用组**：用于**组织多域的用户**，将多个域的用户加入到通用组。通用组的成员可以来自所有域的用户和组，可在林中任何域中指派权限。-> **来自于全林，作用于全林。**
**全局组**：用于**组织一个域内的用户**，将同一域内的用户加入全局组。全局组的成员只能来自当前域的用户和组，而作用域可以是所有的域。-> **来自于本域，作用于全林。**

A-G-DL-P 策略是指将用户账号添加到全局组中，将全局组添加到域本地组中，然后为域本地分配资源权限。按照 A-G-DL-P 策略对用户进行组织和管理会更容易。

A-G-U-DL-P（使用通用组的例子）:

![](/assets/images/move/2020-06-05-14-44-00.png)

## 0x08 传输安全

### IPSec

IPSec 是一种网络层保护协议，通过对传输之前的每个 IP 数据包进行保护来保障网络传输。

作用：
- 提供了身份验证、机密性、完整性（包括数据源发认证和完整性校验）三个安全服务。
- 并可以防止重放攻击。

#### 封装模式

**传输模式**：实现端到端的保护，适合于两台主机间的数据加密（点到点）。源和目的终端必须支持 IPSEC，中间的节点不必支持。

**隧道模式**：两个不同网段（站点到站点）所传送的数据内容的加密或者两个私有 IP 网段穿越 Internet 连接。是网关到网关的，源和目的终端不必支持 IPSEC。

**两者区别**：数据包在传输过程中是否需要更改 IP 报头。

#### 封装协议

- 负载安全封装`ESP`（Encapsulating Security Payload）：提供加密、认证和完整性保护
    - 保证数据的机密性
    - 数据的完整性校验和源验证
    - 一定的抗重放能力

- 认证报头协议`AH`（Authentication Header）：提供认证和完整性保护
    - 数据的完整性校验和源验证
    - 有限的抗重放能力
    - 不能提供数据加密功能


### 直接访问（主机对主机）

#### 默认策略

- 客户端：只响应
- 服务器：请求安全性
- 安全服务器：需要安全性

#### 建立自定义安全策略

**安全策略的定义（筛选器列表、操作、身份验证方法）**

大的来说，安全策略包含两个方面的内容：

- 通信特征的描述：源IP/目的IP/传输层协议/源端口/目的端口、
- 保护方法的描述：丢弃/绕过/IPSEC（安全协议/模式/算法/密钥等）

在 Windows 中，IPSEC 策略的规则包含：

- IP 筛选器列表
- IP 筛选器规则
- 身份验证方法


### VPN 访问

**协议 以 L2TP/IPSec 为主**

虚拟专用网 VPN （Virtual Private Network）是在公共网络上传输私有通信的方法。VPN 常使用隧道技术、加密技术、密钥管理和身份认证技术将两个或多个专用网络连接起来。

![](/assets/images/move/2020-06-05-15-21-55.png)

- 加密的 VPN
    - **IPSec**（提供了完整的安全解决方案，但不支持组播，无法穿越 NAT）
    - **PPTP**（提供认证和加密功能，但安全强度低）
    - **SSL**（提供认证、加密、完整性验证，多用于 Web）
- 非加密的 VPN
    - **L2TP**（提供认证和控制报文加密方式，但不对数据中的数据加密）


**- 安全和管理需求 -**

- 组策略和活动目录结合
    组策略与活动目录结合使用，方便实现策略的集中与分散管理，适应大小不同的各种规模。通过组策略可以设置域和网络的安全，配置系统和用户环境，集中管理软件，软件安装与维护选项。
- 证书颁发与安装
    通过安装合适的数字证书对传输的信息进行加密、解密、数字签名与认证，并作为文件故障恢复的凭证等。具体应用方面包括 Web 服务的安全，E-mail 的安全，IPSec 证书等。
- 分布式访问控制
    在公司中可以将隶属于同一部门的用户组织成全局组，然后再将全局组加入某本地域组中，以此来实现域资源和权限的分配。
- 文件系统安全
    我们可通过部署设置 EFS 加解密，及配置故障代理设置，实现利用备份密钥进行数据恢复。
- 配置端到端的 IPSec
    通过配置端到端的 IPSec，可以实现通过指定的端口进行数据的加密传输，同时可实现身份验证，完整性验证，指定或禁用特定通信协议。
- VPN 的部署
    VPN的建立可实现在公共网络上传输私有通信，降低了企业的成本，同时方便出差的员工可以随时以VPN访问内网，共享与在总部相同的资源、服务，传输过程通过加密保证了通信的安全

