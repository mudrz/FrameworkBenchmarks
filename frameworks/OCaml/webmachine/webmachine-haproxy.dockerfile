FROM ocurrent/opam:fedora-32-ocaml-4.11

ENV DIR webmachine

# https://caml.inria.fr/pub/docs/manual-ocaml/libref/Gc.html
# https://linux.die.net/man/1/ocamlrun
# https://blog.janestreet.com/memory-allocator-showdown/
ENV OCAMLRUNPARAM a=2,o=240

RUN sudo dnf install --assumeyes diffutils postgresql-devel libev-devel

WORKDIR /${DIR}

COPY src/webmachine-tfb.opam src/Makefile /${DIR}/

RUN make install

COPY ./src /${DIR}

RUN sudo chown -R opam: . && make build

# try to keep everything above here in sync with other dockerfiles in project for more efficent use of docker build cache
RUN sudo dnf install --assumeyes haproxy
COPY haproxy.cfg /etc/haproxy/haproxy.cfg
COPY start-servers.sh ./start-servers.sh
RUN sudo chown -R opam: . && chmod +x ./start-servers.sh

CMD ./start-servers.sh && sudo /usr/sbin/haproxy -W -f /etc/haproxy/haproxy.cfg -p /run/haproxy.pid -q
