# promise-repl
Customized nodeJS repl that's nice for working with promises

If you evaluate something that returns a promise, it
adds then and catch handlers and waits for the promise to resolve or
reject, displaying that the result was a promise and then what the
promise resolved to.

To Use:

{code}
> sudo -i
> ./dev/setup_ssh.sh or otherwise set up SSH key
> npm install -g "git+ssh://git@github.com:thirdiron/promise-repl.git"
> exit
> prepl
{code}
TODO: Add some means to toggle this behavior on/off since we maybe don't
necessarily always want to wait for promises to resolve


