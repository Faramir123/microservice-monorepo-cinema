package grpc

import (
	"fmt"
	"net"

	pb "github.com/faramircinema/contracts/gen/go/media"
	"github.com/faramircinema/media-service/internal/application/usecases"
	"github.com/faramircinema/media-service/internal/config"
	"github.com/faramircinema/media-service/internal/infrastructure/images"
	"github.com/faramircinema/media-service/internal/infrastructure/storage"
	handler "github.com/faramircinema/media-service/internal/interfaces/grpc"
	"github.com/faramircinema/media-service/pkg/logger"
	"google.golang.org/grpc"
)

func NewServer(storage storage.Storage, cfg *config.Config) *grpc.Server {
	server := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			RequestLoggerInterceptor,
			TraceIDInterceptor,
		),
	)

	uploadUC := usecases.NewUploadUseCase(storage, images.NewImageProcessor())
	getUC := usecases.NewGetUseCase(storage)
	deleteUC := usecases.NewDeleteUseCase(storage)

	h := handler.NewMediaHandler(uploadUC, getUC, deleteUC)

	pb.RegisterMediaServiceServer(server, h)

	return server
}

func StartGRPC(server *grpc.Server, port int) error {
	addr := fmt.Sprintf(":%d", port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	logger.Info("gRPC server listening on %s", addr)
	return server.Serve(lis)
}
