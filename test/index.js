const { describe, it } = require("mocha");
const { expect } = require("chai");

const { interestingIndexArticle } = require("../lib/openai");
const { INTERESTING_THRESHOLD } = process.env;

const interestingThreshold = parseInt(INTERESTING_THRESHOLD);

describe("interestingIndexArticle function", () => {
  it("should alerts on certain articles", async () => {
    const articles = [
      {
        shouldAlert: true,
        link: "https://gizmodo.com/h-r-block-meta-and-google-slapped-with-rico-suit-1850883099",
        content: `H&R Block, Meta, and Google Slapped With RICO Suit, Allegedly Schemed to Scrape Taxpayer Data
        “H&R Block, Google, and Meta ignored data privacy laws, and passed information about people’s financial lives around like candy,” one attorney said.
        By Mack DeGeurin
        PublishedSeptember 28, 2023
        Comments (13)
        Image for article titled H&amp;R Block, Meta, and Google Slapped With RICO Suit, Allegedly Schemed to Scrape Taxpayer Data
        Photo: David McNew (Getty Images)
        Anyone who has used H&R Block’s tax return preparation services in recent years may have unintentionally helped line Meta and Google’s pockets. That’s according to a new class action lawsuit which alleges the three companies “jointly schemed” to install trackers on the H&R Block site to scan and transmit tax data back to the tech companies which then used elements of the data to engage in targeted advertising.
        Attorneys bringing the case forward claim the three companies’ conduct amounts to a “pattern of racketeering activity” covered under the Racketeer Influenced and Corrupt Organizations Act (RICO), a tool typically reserved for organized crime.
        “H&R Block, Google, and Meta ignored data privacy laws, and passed information about people’s financial lives around like candy,” Brent Wisner, one of the attorneys bringing forward the complaint said.
        The lawsuit, filed in the Northern District of California this week, stems from a bombshell Congressional report released earlier this year detailing the way multiple tax preparation firms, including H&R Block, “recklessly” shared the sensitive tax data of tens of millions of Americans without proper safeguards. At issue are the tax preparation firms’ use of tracking “pixels” placed on their websites. These trackers, which the lawsuit refers to as “spy cams” would allegedly scan tax documents and reveal a variety of personal tax information, including a filer’s name, filing status, federal taxes owed, address, and number of dependents. That data was then anonymized and used for targeted advertising and to train Meta’s AI algorithms, the congressional report notes. The IRS places strong privacy protections over tax data and has rules prohibiting tax preparation firms from using that information for any reason other than assisting in tax returns.
        Justin Hunt, a California resident and the main plaintiff in the new lawsuit says he used H&R Block’s software to file his taxes between 2018 and 2013. He claims he was unaware his personal tax data was being “fraudulently intercepted.” If he had known the details of the H&R partnership with the tech companies, he says he wouldn’t have used the service in the first place.
        Attorneys representing Hunt argue that H&R Block, Meta, and Google “explicitly and intentionally” entered into an agreement to violate taxpayers’ privacy rights for financial gain. The suit seeks full refunds for Hunt and all US taxpayers who spent money on H&R Block’s services since the tracking began, as well as punitive damages for the three companies’ allegedly illegal conduct. Wisner, the lead attorney bridging the case, previously secured a nearly $90 million dollar settlement against agricultural giant Monsanto.
        “Most people would never post their kids’ college account or their retirement savings on Facebook, but H&R Block did something just like that when they handed customer income tax information over to a bunch of advertisers,“ Wisner said in a statement. “It’s like your income tax guy handing your pay stubs and tax returns over to a marketing firm.”
        The lawsuit alleges H&R Block used Meta’s Pixel tracking service since at least 2015. Taxpayers who visited sites with the pixel on it would allegedly have information collected which would be stored until they logged on to Meta-owned products like Facebook or Instagram. At that point, according to the suit, Meta would receive a “dossier” of personal data. The suit claims Meta’s pixels still gather some info on users regardless of whether or not they have a Facebook or Instagram account.
        “[Tax data]is a currency of its own which may be collected and used by Meta for advertising purposes, which essentially transforms this data into cash profit for Meta,” the complaint reads.
        Google, by contrast, allegedly interacted with the tax data through H&R Block’s use of Google Analytics, a free service offered to businesses that collect data from websites. An estimated 70% of the top 100,000 websites use Google Analytics. Though Google bills its tool as a means for businesses to glean insights about potential customers, the lawsuit alleged the search giant deployed Google Analytics to “intercept, track, and collect personal and sensitive information of consumers for its own use.”
        Meta did not immediately respond to Gizmodo’s requests for comment. H&R Block explicitly declined when asked for comment. A spokesperson for Google, meanwhile, tried to lay the burden of responsibility on tax preparation services.
        “We have strict policies and technical features that prohibit Google Analytics customers from collecting data that could be used to identify an individual,” Google spokesperson José Castañeda told Gizmodo. “Site owners—not Google—are in control of what information they collect and must inform their users of how it will be used.”
        The spokesperson said Google has strict policies against advertising to people based on sensitive information. A Meta spokesperson previously told Gizmodo it too has policies prohibiting advertisers from sending sensitive information about people through its business tools. H&R Block’s agreement with Google Analytics, the suit alleges, was similarly “designed” to further the purpose of illegal tax data collection.
        H&R Block was just one of several tax preparation companies named by lawmakers in the Congressional report earlier this year. Vermont Sen. Bernie Sanders and Massachusetts Sen. Elizabeth Warren cited the report’s findings in a fiery letter urging the IRS, FTC, DOJ, and Treasury Inspector General to fully investigate the matter and prosecute companies found to have violated tax laws. More civil lawsuits are almost certain to follow as well.
        “Big Tax Prep has recklessly shared tens of millions of taxpayers’ sensitive personal and financial data with Meta for years, without appropriately disclosing this data usage or protecting the data, and without appropriate taxpayer consent,” the lawmakers wrote in their report.
        More from Gizmodo
        Why the Entire AI World Was Talking About 'Q' This Week
        Halo Season 2 Teases a Major Franchise Fall
        House of the Dragon Comes Flying Back with a Vengeance
        Fallout's First Trailer Welcomes You to a Familiar Post-Apocalypse
        Read More: ‘Big Tax Prep’ Shared Sensitive Data With Meta and Google, Congress Says`,
      },
      {
        shouldAlert: false,
        link: "https://joearms.github.io/published/2014-06-25-minimal-viable-program.html",
        content: `Minimal Viable Programs
        A minimal viable program is the smallest program that solves a particular problem. It is small and beautiful. It has no additional features.
        If you removed a single feature it would be totally useless. If you added a new feature that feature would not be essential, you could use the program without making use of the new feature.
        Very few of the programs I use are minimal viable programs, but some are. I'll describe one such program. This is the ticket system that was used in the Erlang distribution.
        The Erlang Ticket System
        The Erlang ticket system was designed and implemented by Peter Högfeldt in 1986. We needed a ticket system that was easy to use, intuitive, reliable and we wanted it yesterday, so Peter got the job, since he was very busy and didn't have time to take on any new jobs.
        If you want a job done find the busiest person you know and give them an extra job. This is because the reason they are busy is that lot's of people want them to do things because they are good at doing things and that's why they are busy.
        Peter built the ticket system in a couple of hours and we've been using it ever since. I guess the couple of hours were divided into an hours drinking coffee and drawing things on a white board and twenty minutes programming.
        The Ticket System
        Peter's ticket system was simple in the extreme. There was one command. You typed newticket in the shell and got an integer back. Like this:
        $ new_ticket
        The system had made a new file in \${HOME}/tickets/23 and the content of the file would be:
        ticket: 23
        responsible:joe@erix
        status:open
        title: ?
        ----
        Describe your problem here
        This file was also checked into a global CVS archive that all project members had access to. Today one might use GIT or SVN but any revision control system would do.
        The ticket system had a few simple rules:
        The status is open or closed
        The responsible person cannot be changed to somebody new without the permission of the new person
        Project management wanted a reporting system. This was pretty easy, this was done with a few simple shell scripts. For example to find the number of open tickets a simple shell script does the job:
        #!/bin/sh
        grep 'status:open' \${HOME}/tickets/* | wc
        The first ticket system was operational in 1985 and we have used it ever since.
        Adding features
        Do we need to add additional features? The first point to note is there is no time or dates - but wait a moment, this file is checked into a revision control system, so the times when the file is created and modified are in the revision control system and do not need to be added to the ticket.
        What happened later?
        Feature were added - but none that broke the original spirit of the design.
        But we can't make money from a MVP
        Many companies sell “features” - so a MVP will be useless - a product needs new features. But the MVP program will do exactly the same thing in 100 years time as it did yesterday.
        New features mean new sales opportunities, good for the company but not good for the user.
        New features mean new untested code, and backwards incompatibility with earlier versions of the program. Things that are stable for a long time are good.
        The problem with adding features to MVP is that when we ship more complex products like complete operating systems that are packed with programs, the complexity of the individual programs contributes to the complexity of the whole.
        If a system shipped with one complex program it probably would not matter - and it's difficult to imagine the idea of a MVP applying to a complex program like photoshop.
        If the individual components in a system are not MVPs we will soon be overburdened by complexity when we start combining programs to build larger systems.
        If we to have any control over complexity then we should ensure that the basic components are MVPs.
        I really like systems that do one essential thing and do it well. Good examples are Dropbox and Twitter. Dropbox just works. Twitter has a no fuss 140 character tweet box. Simple, easy to understand and minimalist.`,
      },
      {
        shouldAlert: false,
        link: "https://github.com/postmodern/kramdown-man",
        content: `
kramdown-man
CI Code Climate Gem Version
    Homepage
            Issues
            Documentation
Description
A Kramdown convert for converting Markdown files into man pages.
        Features
    Converts markdown to roff:
                Supports codespans, emphasis, and strong fonts.
                Supports normal and tagged paragraphs.
                Supports codeblocks and blockquotes.
                Supports bullet, numbered, and definition lists.
                Supports multi-paragraph list items and blockquotes.
                Supports converting [foo-bar](foo-bar.1.md) and [bash](man:bash(1)) links into SEE ALSO man page references.
            Provides Rake task for converting man/*.md into man pages.
            Uses the pure-Ruby Kramdown markdown parser.
            Supports Ruby 3.x, JRuby, and TruffleRuby.
Synopsis
usage: kramdown-man [options] MARKDOWN_FILE
            -o, --output FILE                Write the man page output to the file
            -V, --version                    Print the version
            -h, --help                       Print the help output
Examples:
            kramdown-man -o man/myprogram.1 man/myprogram.1.md
            kramdown-man man/myprogram.1.md
Render a man page from markdown:
kramdown-man -o man/myprogram.1 man/myprogram.1.md
Preview the rendered man page:
kramdown-man man/myprogram.1.md
Examples
Render a man page from a markdown file:
require 'kramdown/man'
doc = Kramdown::Document.new(File.read('man/kramdown-man.1.md'))
        File.write('man/kramdown-man.1',doc.to_man)
system 'man', 'man/kramdown-man.1'
Define a man and file tasks which render all *.md files within the man/ directory:
require 'kramdown/man/task'
        Kramdown::Man::Task.new
Syntax
        Code
'code'
code
        Emphasis
*emphasis*
emphasis
        Strong
**strong**
strong
        Paragraph
Normal paragraph.
Normal paragraph.
        Usage String
'command' ['--foo'] **FILE**
command [--foo] FILE
        Argument Definitions
*ARG*
        : Description here.
ARG : Description here.
        Option Definitions
'-o', '--option' *VALUE*
        : Description here.
-o, --option VALUE : Description here.
        Links
[website](http://example.com/)
website
        Man Pages
Link to other man pages in a project:
[kramdown-man](kramdown-man.1.md)
kramdown-man
Link to other system man page:
[bash](man:bash(1))
bash
Note: only works on firefox on Linux.
        Email Addresses
Email <bob@example.com>
Email bob@example.com
        Lists
* one
        * two
        * three
    one
            two
            three
Numbered Lists
1. one
        2. two
        3. three
    one
            two
            three
Definition Lists
ex·am·ple
        : a thing characteristic of its kind or illustrating a general rule.
: a person or thing regarded in terms of their fitness to be imitated or the likelihood of their being imitated.
ex·am·ple : a thing characteristic of its kind or illustrating a general rule.
: a person or thing regarded in terms of their fitness to be imitated or the likelihood of their being imitated.
        Blockquotes
> Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.
        >
        > --Antoine de Saint-Exupéry
    Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.
    --Antoine de Saint-Exupéry
Code Blocks
Source code:
    #include <stdio.h>
    int main()
            {
                printf("hello world\n");
                return 0;
            }
Source code:
#include <stdio.h>
int main()
        {
            printf("hello world\n");
            return 0;
        }
Requirements
    kramdown ~> 2.0
Install
gem install kramdown-man
Alternatives
    Redcarpet::Render::ManPage
            ronn
            md2man
Copyright
Copyright (c) 2013-2023 Hal Brodigan
See {file:LICENSE.txt} for details.`,
      },
    ];

    for (let article of articles) {
      const result = await interestingIndexArticle(article);

      if (article.shouldAlert)
        expect(result.index).to.be.greaterThan(interestingThreshold);
      else expect(result.index).to.be.lessThan(interestingThreshold);
    }
  });
});
