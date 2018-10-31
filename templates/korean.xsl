<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xsl:stylesheet [
    <!ENTITY nbsp   "&#160;">
    <!ENTITY mdash  "&#8212;">
    <!ENTITY laquo  "&#171;">
    <!ENTITY raquo  "&#187;">

    <!ENTITY wiki       "http://ru.wikipedia.org/wiki/">
    <!ENTITY koncevich  "Система_Концевича">
    <!ENTITY hangeul    "Хангыль">
]>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output
        method="xml"
        indent="no"
        encoding="utf-8"
        doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
        omit-xml-declaration="yes"
    />

    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="data">
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <title><xsl:value-of select="title"/></title>
                <link rel="stylesheet" href="/css/style.css"/>
                <script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
                <script type="text/javascript" src="/js/jquery.addPlugin.js"></script>
                <script type="text/javascript" src="/js/jquery.color.js"></script>
                <script type="text/javascript" src="/js/jquery.selection.js"></script>
                <script type="text/javascript" src="/js/jquery.hangulEntry.js"></script>
                <script type="text/javascript" src="/js/Korean.js"></script>
            </head>
            <body>
                <h1>
                    <xsl:value-of select="title"/>
                    <span class="super">
                        <a href="https://github.com/ob-ivan/KoreanTranscription" target="_blank">
                            <xsl:text>[Страница проекта]</xsl:text>
                        </a>
                    </span>
                </h1>

                <div class="tabs">
                    <div class="filler">Режим транскрипции:</div>
                    <div class="tab name">Имя</div>
                    <div class="filler"/>
                    <div class="tab text">Текст</div>
                    <div class="filler"/>
                </div>

                <h2  class="name">Транскрипция имени</h2>
                <div class="name container">
                    <form method="post">
                        <input type="hidden" name="action" value="name"/>
                        <table class="form">
                            <tr>
                                <td width="48%" valign="top">
                                    <table class="form">
                                        <tr>
                                            <td valign="top">
                                                <label>
                                                    <p>хангыль</p>
                                                    <input class="korean" type="text" name="korean" value="{name/korean}" maxsize="5"/>
                                                </label>
                                            </td>
                                            <td align="center">
                                                <button type="submit">  GO  </button>
                                            </td>
                                            <td>
                                                <table class="form">
                                                    <tr>
                                                        <td align="right" valign="top">
                                                            <label>
                                                                <p>кириллица</p>
                                                                <input type="text" value="{name/cyrillic}"/>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="right" valign="top">
                                                            <label>
                                                                <p>латиница</p>
                                                                <input type="text" value="{name/latin}"/>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="4%"/>
                                <td width="48%" valign="top" class="help">
                                    <p>
                                        <b>ВНИМАНИЕ!</b> Транскрипция приводится для справочных целей и не претендует на идеальность.
                                        Для официальных переводов рекомендуем обращаться к специалистам по корейскому языку.
                                    </p>
                                    <p>
                                        Чтобы получить <a href="&wiki;&koncevich;" target="_blank">русскую транскрипцию</a> корейского имени,
                                        введите его <a href="&wiki;&hangeul;" target="_blank">в&nbsp;оригинальном написании</a>
                                        в&nbsp;поле &laquo;хангыль&raquo; и нажмите GO.
                                    </p>
                                    <p>
                                        Типичное корейское имя состоит из трёх слогов, первый из которых&nbsp;&mdash; фамилия, он для наглядности
                                        в&nbsp;транскрипции выделяется заглавными буквами.
                                        Остальные два слога (или иногда один)&nbsp;&mdash; это личное имя, оно пишется слитно.
                                    </p>
                                    <p>
                                        Изредка встречаются фамилии из двух слогов. Если вы имеете дело с&nbsp;таким случаем,
                                        поставьте, пожалуйста, пробел после второго слога для облегчения жизни конвертеру.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </form>
                </div>

                <h2  class="text">Транскрипция текста</h2>
                <div class="text container">
                    <form method="post">
                        <input type="hidden" name="action" value="text"/>
                        <table class="form">
                            <tr>
                                <td width="48%" valign="top">
                                    <table class="form">
                                        <tr>
                                            <td valign="top">
                                                <label>
                                                    <p>хангыль</p>
                                                    <textarea class="korean" name="korean" rows="{layout/rows_left}">
                                                        <xsl:value-of select="text/korean"/>
                                                    </textarea>
                                                </label>
                                            </td>
                                            <td align="center">
                                                <button type="submit">  GO  </button>
                                            </td>
                                            <td>
                                                <table class="form">
                                                    <tr>
                                                        <td align="right" valign="top">
                                                            <label>
                                                                <p>кириллица</p>
                                                                <textarea rows="{layout/rows_right}">
                                                                    <xsl:value-of select="text/cyrillic"/>
                                                                </textarea>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="right" valign="top">
                                                            <label>
                                                                <p>латиница</p>
                                                                <textarea rows="{layout/rows_right}">
                                                                    <xsl:value-of select="text/latin"/>
                                                                </textarea>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="4%"/>
                                <td width="48%" valign="top" class="help">
                                    <p>
                                        Введите корейский текст в&nbsp;поле &laquo;<a href="&wiki;&hangeul;" target="_blank">хангыль</a>&raquo;
                                        и нажмите GO, конвертер выдаст его <a href="&wiki;&koncevich;" target="_blank">русскую транскрипцию</a>.
                                    </p>
                                    <p>
                                        Транскрипция далека от совершенства, поскольку в&nbsp;корейском языке (как и в&nbsp;любом другом)
                                        слова читаются не всегда так, как пишутся. Поэтому для реализации полноценной транскрипции
                                        пришлось бы использовать словарь чтений и лексический анализатор. Возможно, когда-нибудь
                                        и до этого руки дойдут, а пока что есть, то есть.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </form>
                </div>

                <script type="text/javascript">var korean = new Korean('<xsl:value-of select="active_tab"/>')</script>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
